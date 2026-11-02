/**
 * Checkpoint Utility for Migration Resumption and State Tracking
 * Persists mapping between Firestore Document IDs and Shopify Product IDs.
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const CHECKPOINT_PATH = path.resolve(__dirname, '../../checkpoint.json');

class CheckpointManager {
  constructor(filepath = CHECKPOINT_PATH) {
    this.filepath = filepath;
    this.data = this.load();
  }

  /**
   * Load checkpoint from file or initialize empty state
   */
  load() {
    try {
      if (fs.existsSync(this.filepath)) {
        const content = fs.readFileSync(this.filepath, 'utf8');
        const parsed = JSON.parse(content);
        return {
          version: '1.0.0',
          createdAt: parsed.createdAt || new Date().toISOString(),
          lastUpdatedAt: parsed.lastUpdatedAt || new Date().toISOString(),
          selectedLocationId: parsed.selectedLocationId || null,
          migrated: parsed.migrated || {},
          failed: parsed.failed || {}
        };
      }
    } catch (err) {
      logger.warn(`Could not read checkpoint file: ${err.message}. Starting fresh.`);
    }

    return {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      selectedLocationId: null,
      migrated: {},
      failed: {}
    };
  }

  /**
   * Persist current state to disk atomically
   */
  save() {
    try {
      this.data.lastUpdatedAt = new Date().toISOString();
      const tempPath = `${this.filepath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tempPath, this.filepath);
    } catch (err) {
      logger.error(`Failed to save checkpoint: ${err.message}`);
    }
  }

  /**
   * Check if a Firestore document is already successfully migrated
   * @param {string} docId 
   * @returns {boolean}
   */
  isMigrated(docId) {
    return Boolean(this.data.migrated[docId] && this.data.migrated[docId].shopifyProductId);
  }

  /**
   * Get migrated info for a product
   * @param {string} docId 
   */
  getMigrated(docId) {
    return this.data.migrated[docId];
  }

  /**
   * Record successful product migration
   * @param {string} docId Firestore Doc ID
   * @param {Object} details Migration metadata
   */
  recordSuccess(docId, details) {
    this.data.migrated[docId] = {
      shopifyProductId: details.shopifyProductId,
      handle: details.handle,
      title: details.title,
      sku: details.sku,
      variantsCount: details.variantsCount || 0,
      totalStock: details.totalStock || 0,
      imagesCount: details.imagesCount || 0,
      variants: details.variants || [],
      migratedAt: new Date().toISOString()
    };
    // If it was in failed, remove it
    if (this.data.failed[docId]) {
      delete this.data.failed[docId];
    }
    this.save();
  }

  /**
   * Record migration failure
   * @param {string} docId 
   * @param {string} name 
   * @param {string} error 
   */
  recordFailure(docId, name, error) {
    this.data.failed[docId] = {
      name: name || 'Unknown',
      error: typeof error === 'object' ? error.message || JSON.stringify(error) : String(error),
      failedAt: new Date().toISOString()
    };
    this.save();
  }

  /**
   * Save selected Shopify location for consistency
   */
  setLocationId(locationId) {
    this.data.selectedLocationId = locationId;
    this.save();
  }

  getLocationId() {
    return this.data.selectedLocationId;
  }

  /**
   * Get summary counts
   */
  getStats() {
    return {
      migratedCount: Object.keys(this.data.migrated).length,
      failedCount: Object.keys(this.data.failed).length
    };
  }
}

module.exports = new CheckpointManager();
