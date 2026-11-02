/**
 * Cloudinary Image Service
 * Validates, prioritizes, and maps Cloudinary image assets for Shopify ingestion.
 * Strictly read-only: does not modify or delete any assets in Cloudinary.
 */

const logger = require('../utils/logger');

class CloudinaryService {
  /**
   * Validates if a string is a valid HTTP/HTTPS URL
   * @param {string} urlString 
   * @returns {boolean}
   */
  isValidUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') return false;
    try {
      const parsed = new URL(urlString.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Processes and orders product images according to migration requirements:
   * - Primary image first
   * - Preserves sortOrder / order
   * - Preserves alt text
   * - Validates URLs
   * 
   * @param {Array<Object|string>} rawImages Images array from Firestore
   * @param {string} fallbackAlt Fallback alt text (e.g. product title)
   * @returns {{ validImages: Array<{ originalSource: string, altText: string }>, failedCount: number, warnings: string[] }}
   */
  processImages(rawImages, fallbackAlt = '') {
    if (!rawImages || !Array.isArray(rawImages) || rawImages.length === 0) {
      return {
        validImages: [],
        failedCount: 0,
        warnings: ['Product has no images.']
      };
    }

    const warnings = [];
    const normalized = [];

    rawImages.forEach((img, index) => {
      let url = '';
      let alt = fallbackAlt;
      let isPrimary = false;
      let order = index;

      if (typeof img === 'string') {
        url = img.trim();
      } else if (img && typeof img === 'object') {
        url = (img.url || img.secure_url || '').trim();
        alt = (img.alt || fallbackAlt || '').trim();
        isPrimary = Boolean(img.isPrimary);
        order = Number.isInteger(img.order) ? img.order : (Number.isInteger(img.sortOrder) ? img.sortOrder : index);
      }

      if (!this.isValidUrl(url)) {
        warnings.push(`Image at index ${index} has invalid or empty URL: "${url}"`);
        return;
      }

      normalized.push({
        url,
        altText: alt || fallbackAlt || 'Product image',
        isPrimary,
        order,
        originalIndex: index
      });
    });

    // Sort images:
    // 1. isPrimary = true comes first
    // 2. Then ascending by order / sortOrder
    // 3. Fallback to original index
    normalized.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      if (a.order !== b.order) return a.order - b.order;
      return a.originalIndex - b.originalIndex;
    });

    const validImages = normalized.map((img) => ({
      originalSource: img.url,
      altText: img.altText
    }));

    const failedCount = rawImages.length - validImages.length;

    return {
      validImages,
      failedCount,
      warnings
    };
  }
}

module.exports = new CloudinaryService();
