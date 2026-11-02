/**
 * Product Migration Orchestrator
 * Coordinates product creation/update, inventory synchronization, and post-migration validation.
 */

const { mapFirestoreToShopify, matchShopifyVariantToSource } = require('./product.mapper');
const shopifyService = require('../services/shopify.service');
const inventoryMigration = require('./inventory.migration');
const checkpoint = require('../utils/checkpoint');
const logger = require('../utils/logger');

class ProductMigrationOrchestrator {
  /**
   * Migrates or updates a single product
   * 
   * @param {Object} firestoreDoc Raw Firestore product document
   * @param {Object} options Configuration options
   * @param {string} options.locationId Shopify location ID for inventory
   * @param {boolean} options.isUpdateMode Whether to update existing Shopify product
   * @param {boolean} options.dryRun Whether this is a dry-run
   * @returns {Promise<Object>} Migration result
   */
  async migrateProduct(firestoreDoc, options = {}) {
    const { locationId, isUpdateMode = false, dryRun = false } = options;
    const docId = firestoreDoc.id;

    // Check if already migrated
    const existingMigration = checkpoint.getMigrated(docId);
    if (existingMigration && !isUpdateMode && !dryRun) {
      logger.info(`Product "${firestoreDoc.name || docId}" already migrated (Shopify ID: ${existingMigration.shopifyProductId}). Skipping.`);
      return {
        status: 'skipped',
        reason: 'already_migrated',
        firestoreDocId: docId,
        shopifyProductId: existingMigration.shopifyProductId,
        title: existingMigration.title,
        handle: existingMigration.handle
      };
    }

    // Map Firestore document to Shopify schema
    const mapped = mapFirestoreToShopify(firestoreDoc, { allocatedHandles: options.allocatedHandles });

    if (dryRun) {
      return {
        status: 'preview',
        firestoreDocId: docId,
        title: mapped.title,
        handle: mapped.handle,
        sku: mapped.commonSku,
        variantsCount: mapped.variants.length,
        totalStock: mapped.totalStock,
        imagesCount: mapped.images.length,
        metafieldsCount: mapped.metafields.length,
        productType: mapped.productType,
        vendor: mapped.vendor,
        warnings: mapped.imageWarnings
      };
    }

    logger.info(`Migrating product "${mapped.title}" (Doc ID: ${docId}, SKU: ${mapped.commonSku})...`);

    let existingProductId = null;
    if (isUpdateMode && existingMigration) {
      existingProductId = existingMigration.shopifyProductId;
    } else {
      // Check if product with this handle already exists in Shopify to prevent duplicates
      const foundByHandle = await shopifyService.findProductByHandle(mapped.handle);
      if (foundByHandle) {
        if (!isUpdateMode) {
          logger.warn(`Product handle "${mapped.handle}" already exists in Shopify (${foundByHandle.id}). Updating instead of duplicating.`);
        }
        existingProductId = foundByHandle.id;
      }
    }

    try {
      // Create or update product in Shopify
      const result = await shopifyService.setProduct(mapped, existingProductId);

      if (result.userErrors && result.userErrors.length > 0) {
        const errorMsg = result.userErrors.map(e => `${e.field?.join('.') || 'General'}: ${e.message}`).join(' | ');
        throw new Error(`Shopify productSet userErrors: ${errorMsg}`);
      }

      const shopifyProduct = result.product;
      if (!shopifyProduct || !shopifyProduct.id) {
        throw new Error('Shopify returned no product object after execution.');
      }

      logger.success(`Product created/updated in Shopify: ${shopifyProduct.title} (${shopifyProduct.id})`);

      // Sync Inventory Levels
      let inventoryResult = { updatedCount: 0, totalStockAssigned: 0, errors: [] };
      const variantNodes = shopifyProduct.variants?.nodes || [];

      if (locationId && variantNodes.length > 0) {
        inventoryResult = await inventoryMigration.syncInventory(variantNodes, mapped.variants, locationId);
        if (inventoryResult.errors.length > 0) {
          logger.warn(`Inventory sync warnings for "${mapped.title}": ${inventoryResult.errors.join('; ')}`);
        } else {
          logger.info(`Inventory synced for "${mapped.title}": ${inventoryResult.totalStockAssigned} units assigned across ${inventoryResult.updatedCount} variants.`);
        }
      }

      // Post-Migration Verification
      const validation = this.validateMigration(mapped, shopifyProduct, inventoryResult);

      // Record success in checkpoint
      checkpoint.recordSuccess(docId, {
        shopifyProductId: shopifyProduct.id,
        handle: shopifyProduct.handle || mapped.handle,
        title: shopifyProduct.title,
        sku: mapped.commonSku,
        variantsCount: variantNodes.length,
        totalStock: inventoryResult.totalStockAssigned,
        imagesCount: mapped.images.length,
        variants: variantNodes.map((node, i) => {
          let matchedSrc = null;
          try {
            matchedSrc = matchShopifyVariantToSource(node, mapped.variants, {
              fallbackIndex: i,
              totalShopifyVariants: variantNodes.length,
              allowPositionalFallback: false
            });
          } catch (_) {
            matchedSrc = null;
          }
          return {
            shopifyVariantId: node.id,
            title: node.title,
            sku: node.sku,
            price: node.price,
            compareAtPrice: node.compareAtPrice,
            inventoryItemId: node.inventoryItem?.id,
            stock: matchedSrc ? matchedSrc.stockQuantity : 0
          };
        })
      });

      return {
        status: 'success',
        firestoreDocId: docId,
        shopifyProductId: shopifyProduct.id,
        title: shopifyProduct.title,
        handle: shopifyProduct.handle,
        sku: mapped.commonSku,
        variantsCount: variantNodes.length,
        totalStock: inventoryResult.totalStockAssigned,
        imagesCount: mapped.images.length,
        validation,
        shopifyAdminUrl: this.buildAdminUrl(shopifyProduct.id)
      };
    } catch (err) {
      logger.error(`Failed to migrate product "${mapped.title}" (${docId}): ${err.message}`, err);
      checkpoint.recordFailure(docId, mapped.title, err.message);
      return {
        status: 'failed',
        firestoreDocId: docId,
        title: mapped.title,
        sku: mapped.commonSku,
        error: err.message
      };
    }
  }

  /**
   * Validates the migrated Shopify product against source data
   */
  validateMigration(mapped, shopifyProduct, inventoryResult) {
    const checks = {
      variantsCountMatch: false,
      skusConsistent: false,
      stockAssigned: inventoryResult.totalStockAssigned,
      expectedStock: mapped.totalStock,
      warnings: []
    };

    const shopifyVariants = shopifyProduct.variants?.nodes || [];
    if (shopifyVariants.length === mapped.variants.length) {
      checks.variantsCountMatch = true;
    } else {
      checks.warnings.push(`Variant count mismatch: expected ${mapped.variants.length}, got ${shopifyVariants.length}`);
    }

    // Verify SKU consistency: All variants must have commonSku
    const allMatchSku = shopifyVariants.every(v => v.sku === mapped.commonSku);
    if (allMatchSku) {
      checks.skusConsistent = true;
    } else {
      checks.warnings.push(`SKU consistency check failed: Not all Shopify variants matched "${mapped.commonSku}"`);
    }

    return checks;
  }

  /**
   * Builds direct web URL to view product in Shopify Admin
   */
  buildAdminUrl(shopifyGid) {
    const match = shopifyGid.match(/\/Product\/(\d+)/);
    const numericId = match ? match[1] : '';
    const shop = process.env.SHOPIFY_SHOP || '';
    const domain = shop.includes('.') ? shop : `${shop}.myshopify.com`;
    return `https://${domain}/admin/products/${numericId}`;
  }
}

module.exports = new ProductMigrationOrchestrator();
