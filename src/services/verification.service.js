/**
 * Verification Service
 * Deeply compares Firebase Firestore source catalog with live Shopify store data.
 * 
 * Capabilities:
 * - Single-product verification (by slug, docId, or first migrated product)
 * - Full-catalog verification across all 63 Firestore products
 * - Exact Option (Size/Color) variant matching via centralized variant-matcher
 * - Identifies products using custom.firestore_id, checkpoint, and handle
 * - Detects duplicate Shopify products, missing products, missing variants, extra variants, and inventory discrepancies
 * - Correctly handles zero-image products and skipped Base64 images as warnings, not false failures
 * - Strictly read-only: No mutations, updates, or deletions executed against Shopify or Firestore
 * - Generates comprehensive summary and detailed per-product verification JSON reports
 */

const fs = require('fs');
const path = require('path');
const firestoreService = require('./firestore.service');
const shopifyService = require('./shopify.service');
const { mapFirestoreToShopify, slugify } = require('../migrations/product.mapper');
const { matchShopifyVariantToSource, matchSourceVariantToShopify } = require('../utils/variant-matcher');
const checkpoint = require('../utils/checkpoint');
const logger = require('../utils/logger');

class VerificationService {
  /**
   * Deeply verifies a single Firestore product against its corresponding Shopify product.
   * 
   * @param {Object} rawDoc Raw Firestore document (with id)
   * @param {Object} shopifyProduct Live Shopify product object from GraphQL
   * @param {Object} [options={}] Options including locationId
   * @returns {Object} Detailed verification result for this product
   */
  verifyProduct(rawDoc, shopifyProduct, options = {}) {
    const targetLocationId = process.env.SHOPIFY_LOCATION_ID || options.locationId || 'gid://shopify/Location/90879655990';
    const mapped = mapFirestoreToShopify(rawDoc, { allocatedHandles: options.allocatedHandles });

    const checks = [];
    const warnings = [];
    const errors = [];

    // Pre-index shopify metafields for quick lookup
    const shopifyMetafields = shopifyProduct.metafields?.nodes || [];
    const metaMap = new Map();
    shopifyMetafields.forEach(m => metaMap.set(m.key, m.value));

    const addCheck = (field, sourceVal, shopifyVal, condition = null) => {
      const isMatch = condition !== null ? Boolean(condition) : String(sourceVal ?? '').trim() === String(shopifyVal ?? '').trim();
      const status = isMatch ? 'PASS' : 'FAIL';
      checks.push({ field, sourceVal, shopifyVal, status });
      if (!isMatch) {
        errors.push(`Field "${field}" mismatch: expected "${sourceVal}", got "${shopifyVal}"`);
      }
    };

    // 1. Core Product Attributes
    addCheck('Title', mapped.title, shopifyProduct.title);
    
    // Handle verification: validates mapped handle, title slug, original slug, or metafield original_slug
    const handleMatches = (
      shopifyProduct.handle === mapped.handle ||
      shopifyProduct.handle === slugify(rawDoc.name) ||
      shopifyProduct.handle === mapped.originalSlug ||
      (metaMap.has('original_slug') && metaMap.get('original_slug') === mapped.originalSlug)
    );
    addCheck('Handle', mapped.handle, shopifyProduct.handle, handleMatches);
    addCheck('Status', mapped.status, shopifyProduct.status);
    addCheck('Vendor', mapped.vendor, shopifyProduct.vendor);
    addCheck('Product Type', mapped.productType, shopifyProduct.productType);

    // 2. Media / Image Verification
    const shopifyMediaNodes = shopifyProduct.media?.nodes || [];
    const expectedMediaCount = mapped.images.length;
    const actualMediaCount = shopifyMediaNodes.length;

    if (expectedMediaCount === 0) {
      // Product has no valid images in Firestore (e.g. SBF 024, 036)
      if (actualMediaCount === 0) {
        checks.push({
          field: 'Media Count',
          sourceVal: 0,
          shopifyVal: 0,
          status: 'PASS',
          note: 'Product legitimately has 0 images in Firestore source.'
        });
      } else {
        checks.push({
          field: 'Media Count',
          sourceVal: 0,
          shopifyVal: actualMediaCount,
          status: 'PASS',
          note: `Shopify has ${actualMediaCount} media items while Firestore had none.`
        });
      }
      warnings.push(`Product "${mapped.title}" has 0 images in Firestore catalog.`);
    } else {
      addCheck('Valid Media Count', expectedMediaCount, actualMediaCount);
    }

    if (mapped.failedImageCount > 0) {
      warnings.push(`Skipped ${mapped.failedImageCount} embedded Base64 image(s) in Firestore catalog (preserved Cloudinary HTTP URLs).`);
    }

    // 3. Variant Count & Option Integrity
    const shopifyVariants = shopifyProduct.variants?.nodes || [];
    const expectedVariantCount = mapped.variants.length;
    const actualVariantCount = shopifyVariants.length;

    addCheck('Variant Count', expectedVariantCount, actualVariantCount);

    const variantChecks = [];
    let allVariantsMatched = true;
    let allSkusMatched = true;
    let allPricesMatched = true;
    let allStockMatched = true;
    let expectedTotalStock = 0;
    let shopifyTotalStock = 0;

    // Check each source variant exists in Shopify
    for (let i = 0; i < mapped.variants.length; i++) {
      const srcV = mapped.variants[i];
      expectedTotalStock += srcV.stockQuantity;

      let shpV = null;
      let matchError = null;

      try {
        shpV = matchSourceVariantToShopify(srcV, shopifyVariants);
      } catch (err) {
        matchError = err.message;
        allVariantsMatched = false;
        errors.push(`Variant [Size: ${srcV.size}, Color: ${srcV.color || 'none'}] match error: ${err.message}`);
      }

      if (!shpV) {
        variantChecks.push({
          size: srcV.size,
          color: srcV.color,
          expectedSku: srcV.sku,
          expectedPrice: srcV.price,
          expectedStock: srcV.stockQuantity,
          status: 'MISSING',
          error: matchError || 'Variant missing in Shopify'
        });
        continue;
      }

      // Check SKU, Price, CompareAtPrice
      const skuMatches = srcV.sku === shpV.sku;
      const priceMatches = Number(srcV.price) === Number(shpV.price);
      const comparePriceMatches = srcV.compareAtPrice ? Number(srcV.compareAtPrice) === Number(shpV.compareAtPrice) : true;

      // Check stock at configured location
      const levels = shpV.inventoryItem?.inventoryLevels?.nodes || [];
      const locationLevel = levels.find(l => l.location?.id === targetLocationId) || levels[0];
      const shopifyStock = locationLevel?.quantities?.find(q => q.name === 'available')?.quantity ?? 0;
      shopifyTotalStock += shopifyStock;

      const stockMatches = srcV.stockQuantity === shopifyStock;

      if (!skuMatches) {
        allSkusMatched = false;
        errors.push(`Variant Size "${srcV.size}" SKU mismatch: expected "${srcV.sku}", got "${shpV.sku}"`);
      }
      if (!priceMatches) {
        allPricesMatched = false;
        errors.push(`Variant Size "${srcV.size}" Price mismatch: expected ₹${srcV.price}, got ₹${shpV.price}`);
      }
      if (!stockMatches) {
        allStockMatched = false;
        errors.push(`Variant Size "${srcV.size}" Stock mismatch: expected ${srcV.stockQuantity}, got ${shopifyStock} in Shopify`);
      }

      const variantPassed = skuMatches && priceMatches && stockMatches && comparePriceMatches;
      variantChecks.push({
        shopifyVariantId: shpV.id,
        title: shpV.title,
        size: srcV.size,
        color: srcV.color,
        sku: shpV.sku,
        expectedSku: srcV.sku,
        skuMatches,
        price: shpV.price,
        expectedPrice: srcV.price,
        priceMatches,
        compareAtPrice: shpV.compareAtPrice,
        expectedCompareAtPrice: srcV.compareAtPrice,
        comparePriceMatches,
        shopifyAvailable: shopifyStock,
        expectedStock: srcV.stockQuantity,
        stockMatches,
        inventoryItemId: shpV.inventoryItem?.id,
        status: variantPassed ? 'PASS' : 'FAIL'
      });
    }

    // Check for extra variants in Shopify that do not exist in Firestore
    const extraVariants = [];
    for (const shpV of shopifyVariants) {
      try {
        matchShopifyVariantToSource(shpV, mapped.variants, {
          allowPositionalFallback: false
        });
      } catch (_) {
        extraVariants.push({
          id: shpV.id,
          title: shpV.title,
          sku: shpV.sku
        });
        errors.push(`Extra variant in Shopify not present in Firestore: "${shpV.title}" (${shpV.id})`);
      }
    }

    // 4. Fashion Metafield Attributes Verification
    const expectedMetaKeys = [
      'fabric', 'fit', 'occasion', 'pattern', 'feeding_friendly', 
      'maternity', 'care_instructions', 'short_description', 'firestore_id', 'original_slug'
    ];

    const metafieldChecks = [];
    expectedMetaKeys.forEach(key => {
      const liveVal = metaMap.get(key);
      const mappedVal = mapped.metafields.find(m => m.key === key)?.value;

      if (mappedVal !== undefined && mappedVal !== null) {
        const matches = String(liveVal ?? '').trim() === String(mappedVal).trim();
        metafieldChecks.push({
          key,
          expected: mappedVal,
          live: liveVal,
          status: matches ? 'PASS' : 'FAIL'
        });
        if (!matches) {
          errors.push(`Metafield "custom.${key}" mismatch: expected "${mappedVal}", got "${liveVal}"`);
        }
      } else {
        // Optional metafield
        metafieldChecks.push({
          key,
          expected: null,
          live: liveVal || null,
          status: 'OPTIONAL'
        });
      }
    });

    // Ensure custom.firestore_id matches exactly
    const liveDocId = metaMap.get('firestore_id');
    if (liveDocId && liveDocId !== rawDoc.id) {
      errors.push(`Metafield "custom.firestore_id" mismatch: expected "${rawDoc.id}", got "${liveDocId}"`);
    }

    const allChecksPassed = checks.every(c => c.status === 'PASS');
    const allVariantsValid = allVariantsMatched && allSkusMatched && allPricesMatched && allStockMatched && extraVariants.length === 0;
    const allMetafieldsValid = metafieldChecks.filter(m => m.status !== 'OPTIONAL').every(m => m.status === 'PASS');

    const overallPassed = allChecksPassed && allVariantsValid && allMetafieldsValid;
    const status = overallPassed ? 'PASS' : 'FAIL';

    return {
      firestoreDocId: rawDoc.id,
      shopifyProductId: shopifyProduct.id,
      title: mapped.title,
      handle: mapped.handle,
      status,
      overallPassed,
      checks,
      variantChecks,
      metafieldChecks,
      extraVariants,
      expectedTotalStock,
      shopifyTotalStock,
      stockDelta: expectedTotalStock - shopifyTotalStock,
      warnings,
      errors
    };
  }

  /**
   * Builds multi-layered lookup index for Shopify products.
   * 
   * @param {Array<Object>} shopifyProducts All live products retrieved from Shopify
   * @returns {Object} Index maps
   */
  buildShopifyIndex(shopifyProducts) {
    const byFirestoreId = new Map();
    const byHandle = new Map();
    const byId = new Map();
    const duplicateShopifyProducts = [];

    shopifyProducts.forEach(prod => {
      byId.set(prod.id, prod);

      // Index by handle
      if (prod.handle) {
        const handleLower = prod.handle.toLowerCase();
        if (!byHandle.has(handleLower)) {
          byHandle.set(handleLower, []);
        }
        byHandle.get(handleLower).push(prod);
      }

      // Index by custom.firestore_id metafield
      const metafields = prod.metafields?.nodes || [];
      const firestoreIdMeta = metafields.find(m => m.key === 'firestore_id' || (m.namespace === 'custom' && m.key === 'firestore_id'));
      if (firestoreIdMeta?.value) {
        const fId = firestoreIdMeta.value.trim();
        if (!byFirestoreId.has(fId)) {
          byFirestoreId.set(fId, []);
        }
        byFirestoreId.get(fId).push(prod);
      }
    });

    // Detect duplicate products in Shopify
    byFirestoreId.forEach((list, fId) => {
      if (list.length > 1) {
        duplicateShopifyProducts.push({
          type: 'duplicate_firestore_id',
          firestoreDocId: fId,
          products: list.map(p => ({ id: p.id, title: p.title, handle: p.handle }))
        });
      }
    });

    byHandle.forEach((list, handle) => {
      if (list.length > 1) {
        duplicateShopifyProducts.push({
          type: 'duplicate_handle',
          handle,
          products: list.map(p => ({ id: p.id, title: p.title }))
        });
      }
    });

    return {
      byFirestoreId,
      byHandle,
      byId,
      duplicateShopifyProducts
    };
  }

  /**
   * Full Catalog Verification Workflow
   * Fetches all 63 Firestore products, queries all Shopify products, indexes them,
   * performs deep comparative verification for all products, and generates JSON reports.
   * 
   * @param {Object} [options={}] Options including locationId
   * @returns {Promise<Object>} Verification summary and details
   */
  async verifyCatalog(options = {}) {
    logger.banner('YEZ BEE - Comprehensive Full-Catalog Verification');

    const targetLocationId = process.env.SHOPIFY_LOCATION_ID || options.locationId || 'gid://shopify/Location/90879655990';
    logger.info(`Shopify Verification Target Location: ${targetLocationId}`);

    // 1. Fetch Firestore catalog
    logger.info('Fetching complete product catalog from Firebase Firestore...');
    const firestoreProducts = await firestoreService.getAllProducts();
    logger.info(`Retrieved ${firestoreProducts.length} products from Firestore.`);

    // 2. Fetch live Shopify store products
    logger.info('Fetching existing products from Shopify Admin GraphQL API...');
    const shopifyProducts = await shopifyService.getAllProducts(15);
    logger.info(`Retrieved ${shopifyProducts.length} existing products from Shopify.`);

    // 3. Build index & check duplicate Shopify products
    const index = this.buildShopifyIndex(shopifyProducts);
    if (index.duplicateShopifyProducts.length > 0) {
      logger.warn(`Found ${index.duplicateShopifyProducts.length} duplicate Shopify product mapping(s)!`);
    }

    // 4. Verify each product
    const verifiedProducts = [];
    const missingProducts = [];
    const failedProducts = [];
    const passedProducts = [];
    const allWarnings = [];

    let totalCatalogExpectedStock = 0;
    let totalLiveShopifyStock = 0;
    let totalVerifiedVariants = 0;
    const allocatedHandles = new Map();

    for (let i = 0; i < firestoreProducts.length; i++) {
      const rawDoc = firestoreProducts[i];
      const mapped = mapFirestoreToShopify(rawDoc, { allocatedHandles });
      totalCatalogExpectedStock += mapped.totalStock;

      // Find in Shopify using multi-layered strategy:
      // Priority 1: custom.firestore_id metafield
      // Priority 2: Checkpoint shopifyProductId
      // Priority 3: Handle
      let matches = index.byFirestoreId.get(rawDoc.id) || [];
      
      if (matches.length === 0) {
        const checkpointInfo = checkpoint.getMigrated(rawDoc.id);
        if (checkpointInfo?.shopifyProductId) {
          const prodById = index.byId.get(checkpointInfo.shopifyProductId);
          if (prodById) matches = [prodById];
        }
      }

      if (matches.length === 0 && mapped.handle) {
        const prodByHandle = index.byHandle.get(mapped.handle.toLowerCase());
        if (prodByHandle && prodByHandle.length > 0) {
          matches = prodByHandle;
        }
      }

      // Check results
      if (matches.length === 0) {
        missingProducts.push({
          firestoreDocId: rawDoc.id,
          title: mapped.title,
          handle: mapped.handle,
          expectedStock: mapped.totalStock,
          variantsCount: mapped.variants.length,
          status: 'NOT_MIGRATED'
        });
        continue;
      }

      if (matches.length > 1) {
        const dupErr = `Multiple Shopify products match Firestore Doc ${rawDoc.id}: ${matches.map(m => m.id).join(', ')}`;
        failedProducts.push({
          firestoreDocId: rawDoc.id,
          title: mapped.title,
          handle: mapped.handle,
          status: 'DUPLICATE_IN_SHOPIFY',
          error: dupErr
        });
        continue;
      }

      // Exactly 1 match found -> Deep verification
      const shopifyProd = matches[0];
      const result = this.verifyProduct(rawDoc, shopifyProd, { ...options, allocatedHandles });

      totalLiveShopifyStock += result.shopifyTotalStock;
      totalVerifiedVariants += result.variantChecks.length;

      verifiedProducts.push(result);
      if (result.warnings.length > 0) {
        allWarnings.push(...result.warnings.map(w => `[${result.title}] ${w}`));
      }

      if (result.overallPassed) {
        passedProducts.push(result);
      } else {
        failedProducts.push(result);
      }
    }

    // 5. Build Summary Statistics
    const summary = {
      verifiedAt: new Date().toISOString(),
      locationId: targetLocationId,
      totalFirestoreProducts: firestoreProducts.length,
      totalShopifyProducts: shopifyProducts.length,
      migratedCount: verifiedProducts.length,
      pendingMigrationCount: missingProducts.length,
      passedCount: passedProducts.length,
      failedCount: failedProducts.length,
      duplicateShopifyProductsCount: index.duplicateShopifyProducts.length,
      totalCatalogExpectedStock,
      totalLiveShopifyStock,
      totalVerifiedVariants,
      warningsCount: allWarnings.length
    };

    // 6. Terminal Output
    console.log('\n' + '='.repeat(90));
    console.log('              YEZ BEE - FULL CATALOG VERIFICATION AUDIT');
    console.log('='.repeat(90));
    console.log(` Total Products in Firestore Catalog:  ${summary.totalFirestoreProducts}`);
    console.log(` Existing Products in Shopify Store:   ${summary.totalShopifyProducts}`);
    console.log(` Products Verified in Shopify:         ${summary.migratedCount}`);
    console.log(` Products Pending Migration:           ${summary.pendingMigrationCount}`);
    console.log(` Verified Products 100% Passed:        ${summary.passedCount}`);
    console.log(` Verified Products with Differences:   ${summary.failedCount}`);
    console.log(` Duplicate Shopify Products Detected:  ${summary.duplicateShopifyProductsCount}`);
    console.log(` Expected Stock for Verified Products: ${verifiedProducts.reduce((sum, p) => sum + p.expectedTotalStock, 0)} units`);
    console.log(` Actual Live Stock in Shopify Store:   ${summary.totalLiveShopifyStock} units`);
    console.log('='.repeat(90));

    // Show details of verified products
    if (verifiedProducts.length > 0) {
      console.log('\n--- VERIFIED PRODUCTS BREAKDOWN ---');
      verifiedProducts.forEach(p => {
        const badge = p.overallPassed ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
        console.log(` ${badge} "${p.title}" (handle: ${p.handle}) -> Shopify ID: ${p.shopifyProductId}`);
        console.log(`        Expected Stock: ${p.expectedTotalStock} units | Shopify Stock: ${p.shopifyTotalStock} units | Variants: ${p.variantChecks.length}`);
        if (p.errors.length > 0) {
          p.errors.forEach(err => console.log(`        \x1b[31m✖ Error:\x1b[0m ${err}`));
        }
        if (p.warnings.length > 0) {
          p.warnings.forEach(w => console.log(`        \x1b[33m⚠ Warning:\x1b[0m ${w}`));
        }
      });
    }

    if (missingProducts.length > 0) {
      console.log(`\n--- PENDING MIGRATION PRODUCTS (${missingProducts.length} of ${summary.totalFirestoreProducts}) ---`);
      console.log(` The following products exist in Firestore but have not yet been migrated to Shopify:`);
      missingProducts.slice(0, 10).forEach(p => {
        console.log(`   - "${p.title}" (handle: "${p.handle}", Doc ID: ${p.firestoreDocId})`);
      });
      if (missingProducts.length > 10) {
        console.log(`   ... and ${missingProducts.length - 10} more pending products.`);
      }
    }

    // 7. Write JSON Reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const summaryReportPath = path.resolve(__dirname, `../../reports/verification-full-summary-${timestamp}.json`);
    const detailsReportPath = path.resolve(__dirname, `../../reports/verification-full-details-${timestamp}.json`);

    fs.writeFileSync(summaryReportPath, JSON.stringify({
      summary,
      duplicateShopifyProducts: index.duplicateShopifyProducts,
      missingProducts,
      verifiedSummary: verifiedProducts.map(p => ({
        firestoreDocId: p.firestoreDocId,
        shopifyProductId: p.shopifyProductId,
        title: p.title,
        handle: p.handle,
        status: p.status,
        expectedStock: p.expectedTotalStock,
        shopifyStock: p.shopifyTotalStock,
        errors: p.errors,
        warnings: p.warnings
      }))
    }, null, 2), 'utf8');

    fs.writeFileSync(detailsReportPath, JSON.stringify({
      summary,
      verifiedProducts,
      missingProducts,
      duplicateShopifyProducts: index.duplicateShopifyProducts
    }, null, 2), 'utf8');

    logger.success(`Verification reports generated:\n  - Summary: ${summaryReportPath}\n  - Details: ${detailsReportPath}\n`);

    return {
      summary,
      verifiedProducts,
      missingProducts,
      failedProducts,
      passedProducts,
      summaryReportPath,
      detailsReportPath
    };
  }
}

module.exports = new VerificationService();
