/**
 * Inventory Migration Service
 * Manages inventory activation and level adjustments across Shopify locations.
 * Compliant with Shopify Admin GraphQL API 2026-10:
 * - Uses inventorySetQuantities mutation with name: "available"
 * - Implements @idempotent(key: $idempotencyKey) directive
 * - Enforces changeFromQuantity to eliminate race conditions
 * - Activates inventory items at target location if not yet stocked
 * - Verifies live inventory levels post-mutation (never assumes success from HTTP 200)
 */

const crypto = require('crypto');
const shopifyService = require('../services/shopify.service');
const logger = require('../utils/logger');
const { matchShopifyVariantToSource } = require('../utils/variant-matcher');

class InventoryMigrationService {
  /**
   * Selects or resolves target Shopify location for inventory assignments
   * @param {string|null} preferredLocationId 
   * @returns {Promise<Object>} Selected location object { id, name }
   */
  async resolveLocation(preferredLocationId = null) {
    const locations = await shopifyService.getLocations();

    if (!locations || locations.length === 0) {
      throw new Error('No active inventory locations found in your Shopify store. Please check Settings -> Locations.');
    }

    if (preferredLocationId) {
      const match = locations.find(loc => 
        loc.id === preferredLocationId || 
        loc.id.endsWith(`/${preferredLocationId}`) || 
        loc.name.toLowerCase() === preferredLocationId.toLowerCase()
      );
      if (match) {
        logger.info(`Using configured Shopify location: "${match.name}" (${match.id})`);
        return match;
      }
      logger.warn(`Preferred location ID "${preferredLocationId}" not found. Falling back to primary location.`);
    }

    // Default to the first location (usually primary)
    const primary = locations[0];
    logger.info(`Selected Shopify inventory location: "${primary.name}" (${primary.id})`);
    return primary;
  }

  /**
   * Ensures an inventory item is activated at the target location.
   * If not activated, calls inventoryActivate.
   * 
   * @param {string} inventoryItemId 
   * @param {string} locationId 
   * @returns {Promise<{ activated: boolean, currentAvailable: number, error?: string }>}
   */
  async ensureItemActivated(inventoryItemId, locationId) {
    // 1. Check current activation status
    const query = `
      query CheckItemActivation($id: ID!) {
        inventoryItem(id: $id) {
          id
          tracked
          inventoryLevels(first: 10) {
            nodes {
              location {
                id
                name
              }
              quantities(names: ["available", "on_hand"]) {
                name
                quantity
              }
            }
          }
        }
      }
    `;

    const res = await shopifyService.executeGraphQL(query, { id: inventoryItemId });
    const item = res?.inventoryItem;
    if (!item) {
      throw new Error(`Inventory item ${inventoryItemId} not found in Shopify.`);
    }

    const levels = item.inventoryLevels?.nodes || [];
    const locationLevel = levels.find(l => l.location?.id === locationId);

    if (locationLevel) {
      const availQty = locationLevel.quantities?.find(q => q.name === 'available')?.quantity ?? 0;
      return { activated: true, currentAvailable: availQty };
    }

    // 2. Not activated at this location -> call inventoryActivate
    logger.info(`Activating inventory item ${inventoryItemId} at location ${locationId}...`);
    const activateMutation = `
      mutation InventoryActivate($inventoryItemId: ID!, $locationId: ID!) {
        inventoryActivate(inventoryItemId: $inventoryItemId, locationId: $locationId) {
          inventoryLevel {
            id
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    const actRes = await shopifyService.executeGraphQL(activateMutation, {
      inventoryItemId,
      locationId
    });

    const userErrors = actRes?.inventoryActivate?.userErrors || [];
    if (userErrors.length > 0) {
      const errDetail = userErrors.map(e => `${e.code || 'ERROR'}: ${e.message}`).join('; ');
      return { activated: false, currentAvailable: 0, error: errDetail };
    }

    return { activated: true, currentAvailable: 0 };
  }

  /**
   * Sets available inventory quantities using modern inventorySetQuantities mutation with @idempotent directive
   * 
   * @param {Array<Object>} variantNodes Shopify variant nodes
   * @param {Array<Object>} mappedVariants Source variants from Firestore
   * @param {string} locationId Target Shopify location ID
   * @param {Object} [options={}] Optional sync parameters (e.g. onlyMismatches)
   * @returns {Promise<{ updatedCount: number, totalStockAssigned: number, verifiedLevels: Array, errors: Array }>}
   */
  async syncInventory(variantNodes, mappedVariants, locationId, options = {}) {
    if (!variantNodes || variantNodes.length === 0) {
      return { updatedCount: 0, totalStockAssigned: 0, verifiedLevels: [], errors: [] };
    }

    const errors = [];
    const setQuantities = [];

    // Step A: Build variant-to-quantity map & ensure activation
    for (let i = 0; i < variantNodes.length; i++) {
      const node = variantNodes[i];
      const inventoryItemId = node.inventoryItem?.id;

      if (!inventoryItemId) {
        errors.push(`Variant ${node.id} (${node.title}) has no inventoryItemId.`);
        continue;
      }

      // Match source variant using centralized, exact option matcher (no substring matching)
      let sourceVariant = null;
      try {
        sourceVariant = matchShopifyVariantToSource(node, mappedVariants, {
          fallbackIndex: i,
          totalShopifyVariants: variantNodes.length,
          allowPositionalFallback: false
        });
      } catch (matchErr) {
        errors.push(`Variant matching failed for ${node.id} (${node.title}): ${matchErr.message}`);
        continue;
      }

      const targetQuantity = sourceVariant ? Math.max(0, sourceVariant.stockQuantity) : 0;

      // Ensure item is activated at target location and read current available
      try {
        const activationStatus = await this.ensureItemActivated(inventoryItemId, locationId);
        if (!activationStatus.activated) {
          errors.push(`Failed to activate ${inventoryItemId} (${node.title}): ${activationStatus.error}`);
          continue;
        }

        // If only updating mismatches, skip variants that already have exact target quantity
        if (options.onlyMismatches && activationStatus.currentAvailable === targetQuantity) {
          continue;
        }

        setQuantities.push({
          inventoryItemId,
          locationId,
          quantity: targetQuantity,
          changeFromQuantity: activationStatus.currentAvailable,
          title: node.title,
          size: sourceVariant?.size || node.title
        });
      } catch (err) {
        errors.push(`Error checking activation for ${inventoryItemId}: ${err.message}`);
      }
    }

    if (setQuantities.length === 0) {
      return { updatedCount: 0, totalStockAssigned: 0, verifiedLevels: [], errors };
    }

    // Step B: Execute inventorySetQuantities with @idempotent directive
    const mutation = `
      mutation SetAvailableQuantities($input: InventorySetQuantitiesInput!, $idempotencyKey: String!) {
        inventorySetQuantities(input: $input) @idempotent(key: $idempotencyKey) {
          inventoryAdjustmentGroup {
            id
            reason
            changes {
              name
              delta
              quantityAfterChange
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    const idempotencyKey = crypto.randomUUID();
    const input = {
      name: 'available',
      reason: 'correction',
      quantities: setQuantities.map(item => ({
        inventoryItemId: item.inventoryItemId,
        locationId: item.locationId,
        quantity: item.quantity,
        changeFromQuantity: item.changeFromQuantity
      }))
    };

    try {
      const res = await shopifyService.executeGraphQL(mutation, { input, idempotencyKey });
      const userErrors = res?.inventorySetQuantities?.userErrors || [];

      if (userErrors.length > 0) {
        const msg = userErrors.map(e => `[${e.code || 'USER_ERROR'}] ${e.field?.join('.')}: ${e.message}`).join('; ');
        errors.push(`inventorySetQuantities userErrors: ${msg}`);
        logger.error(`inventorySetQuantities userErrors: ${msg}`);
        return { updatedCount: 0, totalStockAssigned: 0, verifiedLevels: [], errors };
      }
    } catch (mutationErr) {
      errors.push(`inventorySetQuantities execution failed: ${mutationErr.message}`);
      logger.error(`inventorySetQuantities execution failed: ${mutationErr.message}`);
      return { updatedCount: 0, totalStockAssigned: 0, verifiedLevels: [], errors };
    }

    // Step C: Post-Mutation Verification (Never assume success just because HTTP 200 returned)
    let updatedCount = 0;
    let totalStockAssigned = 0;
    const verifiedLevels = [];

    for (const item of setQuantities) {
      try {
        const verifyQuery = `
          query VerifyLevel($id: ID!) {
            inventoryItem(id: $id) {
              id
              inventoryLevels(first: 10) {
                nodes {
                  location {
                    id
                  }
                  quantities(names: ["available"]) {
                    name
                    quantity
                  }
                }
              }
            }
          }
        `;

        const verifyRes = await shopifyService.executeGraphQL(verifyQuery, { id: item.inventoryItemId });
        const locNode = verifyRes?.inventoryItem?.inventoryLevels?.nodes?.find(l => l.location?.id === item.locationId);
        const actualAvailable = locNode?.quantities?.find(q => q.name === 'available')?.quantity;

        const isMatch = (actualAvailable === item.quantity);
        verifiedLevels.push({
          title: item.title,
          size: item.size,
          inventoryItemId: item.inventoryItemId,
          expectedQuantity: item.quantity,
          actualAvailable,
          verified: isMatch
        });

        if (isMatch) {
          updatedCount++;
          totalStockAssigned += actualAvailable;
        } else {
          errors.push(`Quantity mismatch for ${item.title}: expected ${item.quantity}, live Shopify value is ${actualAvailable}`);
        }
      } catch (verifyErr) {
        errors.push(`Could not verify live level for ${item.title}: ${verifyErr.message}`);
      }
    }

    return {
      updatedCount,
      totalStockAssigned,
      verifiedLevels,
      errors
    };
  }
}

module.exports = new InventoryMigrationService();
