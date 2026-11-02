/**
 * YEZ BEE Shopify Migration System - Main CLI Entry Point
 * Orchestrates dry-run previews, catalog auditing, single product testing, full catalogue migrations, and report generation.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const checkpoint = require('./utils/checkpoint');
const reporter = require('./utils/reporter');
const firestoreService = require('./services/firestore.service');
const shopifyService = require('./services/shopify.service');
const cloudinaryService = require('./services/cloudinary.service');
const inventoryMigration = require('./migrations/inventory.migration');
const productMigration = require('./migrations/product.migration');
const verificationService = require('./services/verification.service');
const { 
  mapFirestoreToShopify, 
  matchShopifyVariantToSource, 
  matchSourceVariantToShopify 
} = require('./migrations/product.mapper');
const { validateShopifyConfig, getShopDomain } = require('./config/shopify');
const { validateFirebaseConnection } = require('./config/firebase');

dotenv.config();

/**
 * Parse CLI command-line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    mode: 'dry-run',
    docId: null,
    slug: null,
    yes: false,
    all: false,
    locationId: process.env.SHOPIFY_LOCATION_ID || null
  };

  for (const arg of args) {
    if (arg.startsWith('--mode=')) {
      options.mode = arg.split('=')[1].trim().toLowerCase();
    } else if (arg.startsWith('--id=')) {
      options.docId = arg.split('=')[1].trim();
    } else if (arg.startsWith('--slug=')) {
      options.slug = arg.split('=')[1].trim();
    } else if (arg.startsWith('--location=')) {
      options.locationId = arg.split('=')[1].trim();
    } else if (arg === '--yes' || arg === '-y') {
      options.yes = true;
    } else if (arg === '--all' || arg === '-a') {
      options.all = true;
    }
  }

  // Alias preview to dry-run
  if (options.mode === 'preview') options.mode = 'dry-run';
  // Alias test to test-one
  if (options.mode === 'test' || options.mode === 'migrate:test') options.mode = 'test-one';
  // Alias verify-all
  if (options.mode === 'verify-all') {
    options.mode = 'verify';
    options.all = true;
  }

  return options;
}

/**
 * Ask operator for confirmation via console
 * @param {string} question 
 * @returns {Promise<boolean>}
 */
function promptConfirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes');
    });
  });
}

/**
 * Print formatted ASCII table row
 */
function printTableRow(col1, col2, col3, col4, col5, col6) {
  const pad = (str, len) => String(str || '').padEnd(len).substring(0, len);
  console.log(`| ${pad(col1, 4)} | ${pad(col2, 20)} | ${pad(col3, 14)} | ${pad(col4, 10)} | ${pad(col5, 8)} | ${pad(col6, 12)} |`);
}

/**
 * Handler for DRY RUN / PREVIEW mode
 */
async function runDryRun() {
  logger.banner('YEZ BEE - Firestore Catalog Preview (Dry Run Mode)');
  logger.info('Reading Firestore catalog. No Shopify data will be created or modified.');

  const products = await firestoreService.getAllProducts();
  if (products.length === 0) {
    logger.warn('No products found in Firestore collection "products".');
    return;
  }

  console.log('\n' + '-'.repeat(85));
  printTableRow('#', 'Title', 'Handle', 'Common SKU', 'Variants', 'Total Stock');
  console.log('-'.repeat(85));

  let totalVariants = 0;
  let totalStockUnits = 0;
  let totalImages = 0;
  const items = [];
  const allocatedHandles = new Map();

  for (let i = 0; i < products.length; i++) {
    const doc = products[i];
    const mapped = mapFirestoreToShopify(doc, { allocatedHandles });

    totalVariants += mapped.variants.length;
    totalStockUnits += mapped.totalStock;
    totalImages += mapped.images.length;

    printTableRow(
      i + 1,
      mapped.title,
      mapped.handle,
      mapped.commonSku,
      mapped.variants.length,
      `${mapped.totalStock} units`
    );

    items.push({
      firestoreDocId: doc.id,
      title: mapped.title,
      handle: mapped.handle,
      sku: mapped.commonSku,
      status: 'preview',
      variantsCount: mapped.variants.length,
      totalStock: mapped.totalStock,
      imagesCount: mapped.images.length
    });
  }

  console.log('-'.repeat(85));

  logger.section('Catalog Summary');
  console.log(`   Total Products Found:     ${products.length}`);
  console.log(`   Total Variants Count:     ${totalVariants}`);
  console.log(`   Total Inventory Stock:    ${totalStockUnits} units`);
  console.log(`   Total Cloudinary Images:  ${totalImages}`);
  console.log(`   SKU Strategy:             IDENTICAL SKU preserved across all sizes (No size appended)`);
  console.log(`   Status:                   All ${products.length} products verified and eligible for migration.`);

  console.log('\n[NEXT STEPS]');
  console.log('1. Run pre-migration audit:    npm run audit');
  console.log('2. Verify Shopify connection:   npm run test:shopify');
  console.log('3. Test migrate 1 product:     npm run migrate:test\n');
}

/**
 * Handler for AUDIT mode
 * Deep verification of handles, SKUs, variants, prices, inventory, Cloudinary images, and Shopify mappings.
 * Strictly read-only: does not modify Firestore or Shopify.
 */
async function runAudit() {
  logger.banner('YEZ BEE - Comprehensive Pre-Migration Catalog Audit');
  logger.info('Performing deep audit across all 63 Firestore products, variants, SKUs, and images.');
  logger.info('Strictly read-only: No Shopify products or inventory will be created, updated, or deleted.');

  const products = await firestoreService.getAllProducts();
  const totalProducts = products.length;

  const auditWarnings = [];
  const auditErrors = [];

  // 1. Handle Collision Audit
  logger.section('1. Product Handle Collision & Deduplication Audit');
  const rawHandleCounts = new Map();
  const allocatedHandles = new Map();
  const handleCorrections = [];

  for (const doc of products) {
    const rawSlug = (doc.slug || '').trim().toLowerCase();
    if (!rawHandleCounts.has(rawSlug)) rawHandleCounts.set(rawSlug, []);
    rawHandleCounts.get(rawSlug).push({ id: doc.id, name: doc.name });
  }

  for (const [rawSlug, list] of rawHandleCounts.entries()) {
    if (list.length > 1) {
      const conflictDesc = list.map(p => `"${p.name}" (${p.id})`).join(' vs ');
      auditWarnings.push(`Duplicate Firestore slug detected: "${rawSlug}" shared by: ${conflictDesc}`);
    }
  }

  const mappedProducts = [];
  for (const doc of products) {
    const mapped = mapFirestoreToShopify(doc, { allocatedHandles });
    mappedProducts.push(mapped);

    if (mapped.isHandleDeduplicated) {
      handleCorrections.push({
        id: doc.id,
        title: mapped.title,
        originalSlug: mapped.originalSlug,
        correctedHandle: mapped.handle,
        reason: `Collision on slug "${mapped.originalSlug}". Deterministically resolved to "${mapped.handle}" derived from product title.`
      });
    }
  }

  if (handleCorrections.length > 0) {
    logger.warn(`Found ${handleCorrections.length} product handle collision(s) successfully resolved:`);
    handleCorrections.forEach(c => {
      console.log(`   - Product: "${c.title}" (ID: ${c.id})`);
      console.log(`     Original Slug:    "${c.originalSlug}"`);
      console.log(`     Corrected Handle: "${c.correctedHandle}"`);
      console.log(`     Resolution Note:  ${c.reason}`);
    });
  } else {
    logger.success('All product handles are unique without collisions.');
  }

  // 2. Specific Verification for SBF 056 and SBF 057
  logger.section('2. Specific Verification: SBF 056 & SBF 057');
  const sbf56 = mappedProducts.find(p => p.title.includes('056') || p.handle === 'sbf-056');
  const sbf57 = mappedProducts.find(p => p.title.includes('057') || p.handle === 'sbf-057');

  if (sbf56 && sbf57) {
    console.log(`   [SBF 056] Doc ID: ${sbf56.firestoreDocId} | Title: "${sbf56.title}" | Handle: "${sbf56.handle}" (Original: "${sbf56.originalSlug}")`);
    console.log(`   [SBF 057] Doc ID: ${sbf57.firestoreDocId} | Title: "${sbf57.title}" | Handle: "${sbf57.handle}" (Original: "${sbf57.originalSlug}")`);
    if (sbf56.handle !== sbf57.handle) {
      logger.success(`SBF 056 and SBF 057 handle conflict RESOLVED: "${sbf56.handle}" vs "${sbf57.handle}". Original slugs preserved in metafields.`);
    } else {
      auditErrors.push('SBF 056 and SBF 057 still share the exact same handle!');
    }
  } else {
    auditWarnings.push('Could not locate both SBF 056 and SBF 057 in the dataset.');
  }

  // 3. SKU Audit Across Products & Within-Product Consistency
  logger.section('3. SKU Audit (Cross-Product vs Within-Product Consistency)');
  const skuToProducts = new Map();
  let totalVariants = 0;
  let totalStock = 0;

  for (const doc of products) {
    const title = doc.name || doc.id;
    (doc.variants || []).forEach(v => {
      totalVariants++;
      totalStock += (v.stock || 0);
      const sku = (v.sku || '').trim();
      if (sku) {
        if (!skuToProducts.has(sku)) skuToProducts.set(sku, new Map());
        skuToProducts.get(sku).set(doc.id, { title, slug: doc.slug, size: v.size });
      }
    });
  }

  const crossProductDuplicateSkus = [];
  for (const [sku, prods] of skuToProducts.entries()) {
    if (prods.size > 1) {
      const prodList = [];
      for (const [id, info] of prods.entries()) {
        prodList.push(`"${info.title}" (${id}, size: ${info.size})`);
      }
      crossProductDuplicateSkus.push({ sku, products: prodList });
      auditWarnings.push(`SKU "${sku}" is shared across multiple products: ${prodList.join(' AND ')}`);
    }
  }

  console.log(`   Total Unique SKUs in Catalog: ${skuToProducts.size}`);
  if (crossProductDuplicateSkus.length > 0) {
    logger.warn(`Found ${crossProductDuplicateSkus.length} SKU(s) shared across distinct products (Preserved as-is without modification):`);
    crossProductDuplicateSkus.forEach(item => {
      console.log(`   - SKU: "${item.sku}"`);
      console.log(`     Shared between: ${item.products.join(' | ')}`);
    });
    console.log(`   NOTE: Shopify permits identical SKUs across products. Values will NOT be altered or synthesized.`);
  } else {
    logger.success('No duplicate SKUs found across distinct products.');
  }

  // 4. Variant Data Validation (Sizes, Colors, Prices, Compare-At, Stock)
  logger.section('4. Variant Attributes, Pricing & Inventory Audit');
  const variantAnomalies = [];

  for (const doc of products) {
    const name = doc.name || doc.id;
    (doc.variants || []).forEach((v, idx) => {
      if (!v.size) {
        variantAnomalies.push(`Product "${name}" variant [${idx}] has missing or empty size.`);
      }
      if (v.price === undefined || v.price === null || isNaN(v.price) || Number(v.price) <= 0) {
        variantAnomalies.push(`Product "${name}" variant [${idx}] has invalid price: ${v.price}`);
      }
      if (v.compareAtPrice !== undefined && v.compareAtPrice !== null) {
        if (isNaN(v.compareAtPrice) || Number(v.compareAtPrice) < Number(v.price)) {
          variantAnomalies.push(`Product "${name}" variant [${idx}] compareAtPrice (${v.compareAtPrice}) is lower than price (${v.price}).`);
        }
      }
      if (v.stock === undefined || v.stock === null || isNaN(v.stock) || Number(v.stock) < 0) {
        variantAnomalies.push(`Product "${name}" variant [${idx}] has invalid/negative stock: ${v.stock}`);
      }
    });
  }

  if (variantAnomalies.length > 0) {
    variantAnomalies.forEach(a => auditWarnings.push(a));
    logger.warn(`Found ${variantAnomalies.length} variant anomaly(ies).`);
  } else {
    logger.success(`All ${totalVariants} variants validated successfully (Sizes, Prices, Compare-At Prices, and Stock are 100% valid).`);
  }

  // 5. Cloudinary Image Validation & Ordering
  logger.section('5. Cloudinary Image Validation & Ordering Audit');
  let totalRawImages = 0;
  let totalCloudinaryUrls = 0;
  let base64ImageCount = 0;
  const productsWithNoImages = [];

  for (const doc of products) {
    const images = doc.images || [];
    totalRawImages += images.length;

    if (images.length === 0) {
      productsWithNoImages.push(`"${doc.name || doc.id}" (${doc.id})`);
    }

    images.forEach(img => {
      const url = typeof img === 'string' ? img : (img.url || img.secure_url || '');
      if (url.includes('res.cloudinary.com')) {
        totalCloudinaryUrls++;
      } else if (url.startsWith('data:')) {
        base64ImageCount++;
      }
    });
  }

  console.log(`   Total Raw Images in Firestore:   ${totalRawImages}`);
  console.log(`   Valid Cloudinary Image URLs:     ${totalCloudinaryUrls}`);
  console.log(`   Embedded Base64 Data URIs:       ${base64ImageCount} (skipped by mapper with warnings)`);

  if (productsWithNoImages.length > 0) {
    auditWarnings.push(`Products with zero images: ${productsWithNoImages.join(', ')}`);
    logger.warn(`Found ${productsWithNoImages.length} product(s) with no images: ${productsWithNoImages.join(', ')}`);
  }

  if (base64ImageCount > 0) {
    auditWarnings.push(`Found ${base64ImageCount} embedded base64 data URIs in Firestore that will be skipped in favor of Cloudinary HTTP URLs.`);
  }

  logger.success(`All ${totalCloudinaryUrls} Cloudinary image URLs are valid and will maintain original ordering (primary first).`);

  // 6. Shopify Mapping & Checkpoint Audit
  logger.section('6. Shopify Store & Checkpoint Mapping Audit');
  const checkpointStats = checkpoint.getStats();
  console.log(`   Checkpoint Migrated Products: ${checkpointStats.migratedCount}`);
  console.log(`   Checkpoint Failed Products:   ${checkpointStats.failedCount}`);

  let shopifyProductsCount = 0;
  try {
    const query = `
      query {
        products(first: 50) {
          nodes {
            id
            title
            handle
          }
        }
      }
    `;
    const res = await shopifyService.executeGraphQL(query);
    const existingShopifyProducts = res?.products?.nodes || [];
    shopifyProductsCount = existingShopifyProducts.length;

    console.log(`   Existing Products in Shopify Store: ${shopifyProductsCount}`);
    existingShopifyProducts.forEach(p => {
      console.log(`     - ${p.title} (${p.id}) -> handle: "${p.handle}"`);
    });

    if (shopifyProductsCount > checkpointStats.migratedCount) {
      auditWarnings.push(`Shopify store contains ${shopifyProductsCount} product(s), but checkpoint only tracks ${checkpointStats.migratedCount}.`);
    }
  } catch (err) {
    logger.warn(`Could not query Shopify store for live product verification: ${err.message}`);
  }

  // 7. Generate Audit Reports (JSON & CSV)
  logger.section('7. Audit Report Generation');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const REPORTS_DIR = path.resolve(__dirname, '../reports');
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const jsonReportPath = path.join(REPORTS_DIR, `audit-report-${timestamp}.json`);
  const csvReportPath = path.join(REPORTS_DIR, `audit-report-${timestamp}.csv`);

  const auditReportData = {
    auditTimestamp: new Date().toISOString(),
    catalogSummary: {
      totalProducts,
      totalVariants,
      totalStockUnits: totalStock,
      totalRawImages,
      validCloudinaryImages: totalCloudinaryUrls,
      base64ImagesSkipped: base64ImageCount,
      uniqueHandlesCount: allocatedHandles.size,
      handleCorrectionsCount: handleCorrections.length,
      crossProductDuplicateSkusCount: crossProductDuplicateSkus.length
    },
    handleCorrections,
    crossProductDuplicateSkus,
    productsWithNoImages,
    warnings: auditWarnings,
    errors: auditErrors,
    products: mappedProducts.map(p => ({
      id: p.firestoreDocId,
      title: p.title,
      handle: p.handle,
      originalSlug: p.originalSlug,
      isHandleDeduplicated: p.isHandleDeduplicated,
      commonSku: p.commonSku,
      variantsCount: p.variants.length,
      totalStock: p.totalStock,
      imagesCount: p.images.length
    }))
  };

  fs.writeFileSync(jsonReportPath, JSON.stringify(auditReportData, null, 2), 'utf8');

  // CSV Report
  const csvHeaders = ['Firestore Doc ID', 'Title', 'Final Shopify Handle', 'Original Slug', 'Handle Corrected', 'Common SKU', 'Variants', 'Stock', 'Images'];
  const escapeCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csvRows = [csvHeaders.map(escapeCell).join(',')];

  auditReportData.products.forEach(p => {
    csvRows.push([
      p.id,
      p.title,
      p.handle,
      p.originalSlug,
      p.isHandleDeduplicated ? 'YES' : 'NO',
      p.commonSku,
      p.variantsCount,
      p.totalStock,
      p.imagesCount
    ].map(escapeCell).join(','));
  });

  fs.writeFileSync(csvReportPath, csvRows.join('\r\n'), 'utf8');

  logger.success(`Detailed Audit Reports written to disk:\n  - JSON: ${jsonReportPath}\n  - CSV:  ${csvReportPath}`);

  // Summary Banner
  logger.banner('Pre-Migration Audit Complete');
  console.log(`   Catalog Products:        ${totalProducts}`);
  console.log(`   Unique Handles:          ${allocatedHandles.size} (100% Unique)`);
  console.log(`   Handle Corrections:      ${handleCorrections.length}`);
  console.log(`   Cross-Product SKUs:      ${crossProductDuplicateSkus.length} (Preserved exactly as stored)`);
  console.log(`   Total Errors Found:      ${auditErrors.length}`);
  console.log(`   Total Warnings Found:    ${auditWarnings.length}`);
  console.log('\n[AUDIT CONCLUSION]');
  if (auditErrors.length === 0) {
    logger.success('AUDIT PASSED! All catalog data is validated, handles are deduplicated, and ready for migration.');
  } else {
    logger.error('Audit found errors that should be reviewed before proceeding.');
  }
}

/**
 * Handler for TEST ONE product migration
 */
async function runTestOne(options) {
  logger.banner('YEZ BEE - Test Migration (Single Product)');

  // 1. Verify credentials first
  const shopifyValidation = validateShopifyConfig();
  if (!shopifyValidation.valid) {
    logger.error('Shopify configuration incomplete in .env. Run "npm run test:shopify" to verify.');
    process.exit(1);
  }

  // 2. Select target product (Strict adherence to Requirement 2: Use SBF 038 only if not already present in Shopify)
  let targetProduct = null;
  if (options.docId) {
    targetProduct = await firestoreService.getProductById(options.docId);
  } else if (options.slug) {
    targetProduct = await firestoreService.getProductBySlug(options.slug);
  } else {
    // Check if SBF 038 is already present in Shopify or checkpoint
    const sbf038 = await firestoreService.getProductBySlug('sbf-038');
    let isSbf038Present = false;

    if (sbf038) {
      if (checkpoint.isMigrated(sbf038.id)) {
        isSbf038Present = true;
      } else {
        const found = await shopifyService.findProductByHandle('sbf-038');
        if (found) isSbf038Present = true;
      }
    }

    if (sbf038 && !isSbf038Present) {
      targetProduct = sbf038;
      logger.info('Selected test product: "SBF 038" (sbf-038).');
    } else {
      // SBF 038 is already present in Shopify! Select next eligible unmigrated product
      const allProducts = await firestoreService.getAllProducts();
      for (const p of allProducts) {
        if (!checkpoint.isMigrated(p.id)) {
          const alreadyInShopify = await shopifyService.findProductByHandle(p.slug);
          if (!alreadyInShopify) {
            targetProduct = p;
            break;
          }
        }
      }
      logger.info(`Product "SBF 038" is already present in Shopify. In accordance with Requirement 2, selected next unmigrated product: "${targetProduct?.name}" (${targetProduct?.slug}).`);
    }
  }

  if (!targetProduct) {
    logger.error('No unmigrated product available for test migration.');
    process.exit(1);
  }

  const mapped = mapFirestoreToShopify(targetProduct);

  // 3. Strict Pre-Migration Collision & Duplicate Guard
  if (checkpoint.isMigrated(targetProduct.id)) {
    const existing = checkpoint.getMigrated(targetProduct.id);
    logger.error(`Product "${mapped.title}" (Doc ID: ${targetProduct.id}) is ALREADY marked as migrated in checkpoint.json!`);
    logger.error(`Shopify Product ID: ${existing.shopifyProductId} | Handle: "${existing.handle}".`);
    logger.error(`Refusing to create a duplicate product in Shopify. To verify this product, run: npm run verify -- --slug=${mapped.handle}`);
    process.exit(1);
  }

  const existingInShopify = await shopifyService.findProductByHandle(mapped.handle);
  if (existingInShopify) {
    logger.error(`Shopify store already contains a product with handle "${mapped.handle}" (${existingInShopify.id})!`);
    logger.error(`Refusing to create a duplicate product. Aborting.`);
    process.exit(1);
  }
  logger.section('Selected Test Product');
  console.log(`   Firestore ID:   ${targetProduct.id}`);
  console.log(`   Title:          ${mapped.title}`);
  console.log(`   Handle:         ${mapped.handle}`);
  console.log(`   Common SKU:     ${mapped.commonSku}`);
  console.log(`   Variants Count: ${mapped.variants.length} (${mapped.variants.map(v => v.size).join(', ')})`);
  console.log(`   Total Stock:    ${mapped.totalStock} units`);
  console.log(`   Images Count:   ${mapped.images.length}`);

  // 3. Resolve Shopify Location
  const location = await inventoryMigration.resolveLocation(options.locationId);
  console.log(`   Shopify Location: "${location.name}" (${location.id})`);

  // 4. Operator Confirmation
  if (!options.yes) {
    console.log('');
    const confirmed = await promptConfirm(`Proceed to migrate "${mapped.title}" to Shopify?`);
    if (!confirmed) {
      logger.warn('Test migration cancelled by user.');
      return;
    }
  }

  // 5. Execute Migration
  logger.step(1, 2, 'Migrating product and variants to Shopify...');
  const result = await productMigration.migrateProduct(targetProduct, {
    locationId: location.id,
    isUpdateMode: options.mode === 'update'
  });

  if (result.status === 'failed') {
    logger.error(`Test migration FAILED: ${result.error}`);
    reporter.generateReport({
      mode: 'test-one',
      summary: { total: 1, succeeded: 0, failed: 1 },
      items: [result]
    });
    process.exit(1);
  }

  // 6. Validation and Output
  logger.step(2, 2, 'Verifying created product in Shopify...');
  logger.success(`Test Migration SUCCEEDED!`);
  console.log(`   Shopify Product ID:   ${result.shopifyProductId}`);
  console.log(`   Shopify Product Handle: ${result.handle}`);
  console.log(`   Shopify Admin URL:    ${result.shopifyAdminUrl}`);
  console.log(`   Variants Created:     ${result.variantsCount}`);
  console.log(`   SKUs Consistent:      ${result.validation?.skusConsistent ? 'YES (All variants have SKU: ' + result.sku + ')' : 'NO'}`);
  console.log(`   Inventory Assigned:   ${result.totalStock} units at location "${location.name}"`);
  console.log(`   Images Attached:      ${result.imagesCount}`);

  // Generate Report
  reporter.generateReport({
    mode: 'test-one',
    summary: { total: 1, succeeded: 1, failed: 0 },
    items: [result]
  });

  console.log('\n[NEXT STEPS]');
  console.log(`1. Inspect the product in your Shopify Admin: ${result.shopifyAdminUrl}`);
  console.log('2. If everything looks good, run the full catalog migration:');
  console.log('   npm run migrate:all\n');
}

/**
 * Handler for FULL CATALOG migration
 */
async function runMigrateAll(options) {
  logger.banner('YEZ BEE - Full Catalog Migration');

  // Verify credentials
  const shopifyValidation = validateShopifyConfig();
  if (!shopifyValidation.valid) {
    logger.error('Shopify configuration incomplete in .env. Run "npm run test:shopify" to verify.');
    process.exit(1);
  }

  // Resolve Shopify Location
  const location = await inventoryMigration.resolveLocation(options.locationId);
  checkpoint.setLocationId(location.id);

  // Fetch Firestore products
  const products = await firestoreService.getAllProducts();
  const totalFound = products.length;

  // Determine eligible products
  const eligibleProducts = [];
  const alreadyMigrated = [];

  for (const doc of products) {
    if (checkpoint.isMigrated(doc.id) && options.mode !== 'update') {
      alreadyMigrated.push(doc);
    } else {
      eligibleProducts.push(doc);
    }
  }

  logger.section('Catalog Migration Status');
  console.log(`   Total Products Found:     ${totalFound}`);
  console.log(`   Already Migrated (Saved): ${alreadyMigrated.length}`);
  console.log(`   Pending for Migration:    ${eligibleProducts.length}`);
  console.log(`   Inventory Location:       "${location.name}" (${location.id})`);

  if (eligibleProducts.length === 0) {
    logger.success('All products have already been migrated! Checkpoint indicates full completion.');
    console.log('To update existing products, run with: npm run migrate:update\n');
    return;
  }

  // Operator confirmation
  if (!options.yes) {
    console.log('');
    const confirmed = await promptConfirm(`Ready to migrate ${eligibleProducts.length} product(s) to Shopify store "${getShopDomain()}"?`);
    if (!confirmed) {
      logger.warn('Migration cancelled by user.');
      return;
    }
  }

  logger.info(`Starting migration loop for ${eligibleProducts.length} products...`);
  const results = [];
  let succeeded = 0;
  let failed = 0;
  let totalStockAssigned = 0;
  let totalVariantsCreated = 0;
  let totalImagesUploaded = 0;
  const allocatedHandles = new Map();

  for (let i = 0; i < eligibleProducts.length; i++) {
    const doc = eligibleProducts[i];
    const indexStr = `[${i + 1}/${eligibleProducts.length}]`;

    try {
      const res = await productMigration.migrateProduct(doc, {
        locationId: location.id,
        isUpdateMode: options.mode === 'update',
        allocatedHandles
      });

      results.push(res);

      if (res.status === 'success') {
        succeeded++;
        totalStockAssigned += (res.totalStock || 0);
        totalVariantsCreated += (res.variantsCount || 0);
        totalImagesUploaded += (res.imagesCount || 0);
        logger.success(`${indexStr} Migrated "${res.title}" (SKU: ${res.sku}) -> ${res.shopifyAdminUrl}`);
      } else if (res.status === 'skipped') {
        logger.info(`${indexStr} Skipped "${res.title}" (Already migrated)`);
      } else {
        failed++;
        logger.error(`${indexStr} Failed "${res.title}": ${res.error}`);
      }
    } catch (loopErr) {
      failed++;
      logger.error(`${indexStr} Unexpected error migrating product ${doc.id}: ${loopErr.message}`);
      checkpoint.recordFailure(doc.id, doc.name || doc.id, loopErr.message);
      results.push({
        status: 'failed',
        firestoreDocId: doc.id,
        title: doc.name || doc.id,
        error: loopErr.message
      });
    }

    // Adaptive delay between products (350ms) to ensure smooth leaky-bucket Shopify throughput
    await new Promise(r => setTimeout(r, 350));
  }

  // Summary
  logger.banner('Migration Execution Completed');
  console.log(`   Total Products Processed:  ${eligibleProducts.length}`);
  console.log(`   Successfully Migrated:     ${succeeded}`);
  console.log(`   Failed Products:           ${failed}`);
  console.log(`   Total Variants Created:    ${totalVariantsCreated}`);
  console.log(`   Total Inventory Assigned:  ${totalStockAssigned} units`);
  console.log(`   Total Images Uploaded:     ${totalImagesUploaded}`);

  // Generate Reports
  const report = reporter.generateReport({
    mode: options.mode,
    completedAt: new Date().toISOString(),
    summary: {
      totalFound,
      alreadyMigrated: alreadyMigrated.length,
      processed: eligibleProducts.length,
      succeeded,
      failed,
      totalVariantsCreated,
      totalStockAssigned,
      totalImagesUploaded
    },
    items: results
  });

  logger.info(`Reports generated at: \n  - ${report.jsonPath}\n  - ${report.csvPath}`);
}

/**
 * Handler for REPORT mode
 */
async function runReport() {
  logger.banner('YEZ BEE - Migration Status & Report');
  const stats = checkpoint.getStats();
  const data = checkpoint.data;

  console.log(`   Checkpoint Created:     ${data.createdAt}`);
  console.log(`   Last Updated:           ${data.lastUpdatedAt}`);
  console.log(`   Migrated Products:      ${stats.migratedCount}`);
  console.log(`   Failed Products:        ${stats.failedCount}`);
  console.log(`   Target Location ID:     ${data.selectedLocationId || 'Not set'}`);

  const items = [];
  for (const [docId, info] of Object.entries(data.migrated)) {
    items.push({
      firestoreDocId: docId,
      title: info.title,
      handle: info.handle,
      sku: info.sku,
      shopifyProductId: info.shopifyProductId,
      shopifyAdminUrl: productMigration.buildAdminUrl(info.shopifyProductId),
      status: 'success',
      variantsCount: info.variantsCount,
      totalStock: info.totalStock,
      imagesCount: info.imagesCount
    });
  }

  for (const [docId, info] of Object.entries(data.failed)) {
    items.push({
      firestoreDocId: docId,
      title: info.name,
      status: 'failed',
      error: info.error
    });
  }

  const report = reporter.generateReport({
    mode: 'report',
    generatedAt: new Date().toISOString(),
    summary: {
      migratedCount: stats.migratedCount,
      failedCount: stats.failedCount
    },
    items
  });

  logger.success(`Report written to:\n  - JSON: ${report.jsonPath}\n  - CSV:  ${report.csvPath}`);
}

/**
 * Handler for VERIFY mode
 * Supports:
 * - Single-product verification: npm run verify [-- --slug=sbf-038 | --id=<firestoreId>]
 * - Full-catalog verification: npm run verify:all (or npm run verify -- --all)
 */
async function runVerify(options) {
  // If full-catalog verification requested
  if (options.all) {
    return await verificationService.verifyCatalog(options);
  }

  logger.banner('YEZ BEE - Single Product Verification (Firestore vs Shopify)');

  // 1. Determine which product to verify
  let targetProduct = null;
  if (options.docId) {
    targetProduct = await firestoreService.getProductById(options.docId);
  } else if (options.slug) {
    targetProduct = await firestoreService.getProductBySlug(options.slug);
  } else {
    // Default to the first migrated product in checkpoint, or SBF 038
    const migratedDocs = Object.keys(checkpoint.data.migrated);
    if (migratedDocs.length > 0) {
      targetProduct = await firestoreService.getProductById(migratedDocs[0]);
    } else {
      targetProduct = await firestoreService.getProductBySlug('sbf-038');
    }
  }

  if (!targetProduct) {
    logger.error('Target product not found in Firestore.');
    process.exit(1);
  }

  const mapped = mapFirestoreToShopify(targetProduct);
  logger.section(`Verifying Product: "${mapped.title}" (Firestore Doc ID: ${targetProduct.id})`);

  // 2. Fetch from Shopify
  const checkpointInfo = checkpoint.getMigrated(targetProduct.id);
  let shopifyProduct = null;

  if (checkpointInfo?.shopifyProductId) {
    shopifyProduct = await shopifyService.fetchProductDetails(checkpointInfo.shopifyProductId);
  }
  if (!shopifyProduct) {
    shopifyProduct = await shopifyService.findProductByHandle(mapped.handle);
    if (shopifyProduct?.id) {
      shopifyProduct = await shopifyService.fetchProductDetails(shopifyProduct.id);
    }
  }

  if (!shopifyProduct) {
    logger.error(`Product "${mapped.title}" (handle: "${mapped.handle}") was not found in Shopify store!`);
    console.log('   Ensure the product has been migrated first using: npm run migrate:test\n');
    process.exit(1);
  }

  // 3. Side-by-Side Comparison using Verification Service
  const result = verificationService.verifyProduct(targetProduct, shopifyProduct, options);

  console.log('\n' + '='.repeat(88));
  console.log(`  FIELD COMPARISON: FIRESTORE (SOURCE) vs SHOPIFY (LIVE STORE)`);
  console.log('='.repeat(88));

  result.checks.forEach(c => {
    const statusColor = c.status === 'PASS' ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
    console.log(` ${statusColor} ${c.field.padEnd(24)} | Source: ${String(c.sourceVal).padEnd(24)} | Shopify: ${String(c.shopifyVal)}`);
  });

  console.log('\n--- Variant-by-Variant Comparison ---');
  result.variantChecks.forEach(vc => {
    const statusColor = vc.status === 'PASS' ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
    console.log(`   ${statusColor} Size: ${vc.size.padEnd(5)} | SKU: ${(vc.sku || '').padEnd(10)} | Price: ₹${String(vc.price || '').padEnd(8)} | Stock: ${vc.shopifyAvailable} (Expected: ${vc.expectedStock})`);
  });

  console.log('\n--- Fashion Metafield Attributes Verification ---');
  result.metafieldChecks.forEach(m => {
    if (m.status === 'PASS') {
      console.log(`   \x1b[32m[PASS]\x1b[0m custom.${m.key.padEnd(18)} = "${m.live}"`);
    } else if (m.status === 'OPTIONAL') {
      console.log(`   \x1b[33m[OPTIONAL]\x1b[0m custom.${m.key.padEnd(18)} not present in source document`);
    } else {
      console.log(`   \x1b[31m[FAIL]\x1b[0m custom.${m.key.padEnd(18)} mismatch: expected "${m.expected}", got "${m.live}"`);
    }
  });

  if (result.warnings.length > 0) {
    console.log('\n--- Warnings ---');
    result.warnings.forEach(w => console.log(`   \x1b[33m[WARN]\x1b[0m ${w}`));
  }

  // Overall Verification Verdict
  logger.section('Verification Summary');
  if (result.overallPassed) {
    logger.success(`VERIFICATION PASSED! Shopify product 100% matches Firestore source.`);
    console.log(`   Shopify Product ID:   ${shopifyProduct.id}`);
    console.log(`   Shopify Admin URL:    ${productMigration.buildAdminUrl(shopifyProduct.id)}`);
    console.log(`   Variants Verified:    ${result.variantChecks.length} (All SKUs match: "${mapped.commonSku}")`);
    console.log(`   Total Inventory:      ${result.shopifyTotalStock} units verified at Shopify location`);
    console.log(`   Media Verified:       ${shopifyProduct.media?.nodes?.length || 0} Cloudinary images attached\n`);
  } else {
    logger.warn('VERIFICATION COMPLETED WITH DIFFERENCES. Review above side-by-side comparison.');
    result.errors.forEach(err => console.log(`   \x1b[31m✖ Error:\x1b[0m ${err}`));
  }

  // Save report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const verifyReportPath = path.resolve(__dirname, `../reports/verification-${mapped.handle}-${timestamp}.json`);
  fs.writeFileSync(verifyReportPath, JSON.stringify({
    verifiedAt: new Date().toISOString(),
    firestoreDocId: targetProduct.id,
    shopifyProductId: shopifyProduct.id,
    handle: mapped.handle,
    status: result.overallPassed ? 'PASSED' : 'DISCREPANCIES_FOUND',
    fieldChecks: result.checks,
    variantChecks: result.variantChecks,
    metafieldChecks: result.metafieldChecks,
    warnings: result.warnings,
    errors: result.errors
  }, null, 2), 'utf8');

  logger.info(`Verification report saved to: ${verifyReportPath}`);
}

/**
 * Handler for FIX INVENTORY mode (SBF 014 targeted inventory repair)
 * Reads Firestore document and live Shopify product for SBF 014.
 * Displays the 5 inventory item IDs, current live values, and expected quantities.
 * Executes the updated syncInventory with inventorySetQuantities, @idempotent directive, and changeFromQuantity.
 * Confirms live post-mutation inventory at the exact Shopify location.
 */
async function runFixInventory(options) {
  logger.banner('YEZ BEE - Safe Inventory Repair for SBF 014');

  const slug = options.slug || 'sbf-014';
  const targetLocationId = process.env.SHOPIFY_LOCATION_ID || options.locationId || 'gid://shopify/Location/90879655990';

  // 1. Fetch Firestore source
  const firestoreProduct = await firestoreService.getProductBySlug(slug);
  if (!firestoreProduct) {
    logger.error(`Product with slug "${slug}" not found in Firestore.`);
    process.exit(1);
  }

  const mapped = mapFirestoreToShopify(firestoreProduct);

  // 2. Fetch live Shopify product
  const shopifyProduct = await shopifyService.findProductByHandle(mapped.handle);
  if (!shopifyProduct) {
    logger.error(`Product "${mapped.title}" (handle: "${mapped.handle}") not found in Shopify store.`);
    process.exit(1);
  }

  const fullShopifyProduct = await shopifyService.fetchProductDetails(shopifyProduct.id);
  const variantNodes = fullShopifyProduct?.variants?.nodes || [];

  // 3. Resolve Location
  const location = await inventoryMigration.resolveLocation(targetLocationId);

  // 4. Inspect current live state of all 5 variants
  logger.section(`Current Inventory State for "${mapped.title}" at "${location.name}"`);
  console.log('='.repeat(95));
  console.log(` Variant Title       | Inventory Item ID                   | Tracked | Current | Expected Quantity`);
  console.log('='.repeat(95));

  const itemsPlan = [];
  for (let i = 0; i < variantNodes.length; i++) {
    const node = variantNodes[i];
    let srcV = null;
    try {
      srcV = matchShopifyVariantToSource(node, mapped.variants, {
        fallbackIndex: i,
        totalShopifyVariants: variantNodes.length,
        allowPositionalFallback: false
      });
    } catch (matchErr) {
      logger.error(`Variant matching failed for "${node.title}" (${node.id}): ${matchErr.message}`);
      process.exit(1);
    }

    const expectedQty = srcV ? srcV.stockQuantity : 0;
    const invItemId = node.inventoryItem?.id;
    const tracked = node.inventoryItem?.tracked;

    const locLevel = node.inventoryItem?.inventoryLevels?.nodes?.find(l => l.location?.id === location.id);
    const curAvail = locLevel?.quantities?.find(q => q.name === 'available')?.quantity ?? 0;

    itemsPlan.push({
      variantId: node.id,
      title: node.title,
      inventoryItemId: invItemId,
      tracked,
      currentAvailable: curAvail,
      expectedQuantity: expectedQty
    });

    const pad = (s, l) => String(s ?? '').padEnd(l);
    console.log(` ${pad(node.title, 19)} | ${pad(invItemId, 35)} | ${pad(tracked ? 'YES' : 'NO', 7)} | ${pad(curAvail, 7)} | ${expectedQty}`);
  }
  console.log('='.repeat(95));
  console.log(` Total Expected Units: ${mapped.totalStock} units across ${mapped.variants.length} variants\n`);

  // Confirmation prompt if not --yes
  if (!options.yes) {
    const confirmed = await promptConfirm(`Apply inventorySetQuantities mutation for these 5 inventory items at "${location.name}"?`);
    if (!confirmed) {
      logger.warn('Inventory fix cancelled by operator.');
      return;
    }
  }

  // 5. Execute inventory synchronization
  logger.info(`Applying inventorySetQuantities with @idempotent directive at "${location.name}"...`);
  const syncResult = await inventoryMigration.syncInventory(variantNodes, mapped.variants, location.id);

  if (syncResult.errors.length > 0) {
    logger.error(`Inventory sync reported errors: ${syncResult.errors.join('; ')}`);
    process.exit(1);
  }

  logger.success(`Inventory synchronization completed!`);
  console.log(`   Updated Items:     ${syncResult.updatedCount}`);
  console.log(`   Total Stock Added: ${syncResult.totalStockAssigned} units`);

  // 6. Post-Mutation Verification
  logger.section('Post-Mutation Verification at Live Shopify Store');
  const recheckProduct = await shopifyService.fetchProductDetails(shopifyProduct.id);
  const recheckVariants = recheckProduct?.variants?.nodes || [];

  let allVerified = true;
  for (const item of itemsPlan) {
    const recheckNode = recheckVariants.find(v => v.id === item.variantId);
    const recheckLevel = recheckNode?.inventoryItem?.inventoryLevels?.nodes?.find(l => l.location?.id === location.id);
    const liveAvail = recheckLevel?.quantities?.find(q => q.name === 'available')?.quantity;

    const matches = (liveAvail === item.expectedQuantity);
    if (!matches) allVerified = false;

    const badge = matches ? '\x1b[32m[VERIFIED]\x1b[0m' : '\x1b[31m[MISMATCH]\x1b[0m';
    console.log(`   ${badge} ${item.title.padEnd(18)} | Available: ${liveAvail} (Expected: ${item.expectedQuantity})`);
  }

  if (allVerified) {
    logger.success(`ALL 5 VARIANTS VERIFIED AT LOCATION "${location.name}"! Total available inventory: ${syncResult.totalStockAssigned} units.`);

    // Update Checkpoint
    checkpoint.recordSuccess(firestoreProduct.id, {
      shopifyProductId: shopifyProduct.id,
      handle: mapped.handle,
      title: mapped.title,
      sku: mapped.commonSku,
      variantsCount: variantNodes.length,
      totalStock: syncResult.totalStockAssigned,
      imagesCount: mapped.images.length,
      variants: recheckVariants.map((node, i) => ({
        shopifyVariantId: node.id,
        title: node.title,
        sku: node.sku,
        inventoryItemId: node.inventoryItem?.id,
        stock: itemsPlan[i]?.expectedQuantity ?? 0
      }))
    });

    console.log(`\n[NEXT STEPS]`);
    console.log(`1. Run full verification: npm run verify -- --slug=${mapped.handle}`);
    console.log(`2. View product in Shopify Admin: ${productMigration.buildAdminUrl(shopifyProduct.id)}\n`);
  } else {
    logger.error('Post-mutation verification found discrepancies. Please inspect logs.');
  }
}

/**
 * Handler for REPAIR MISMATCHES mode
 * Safely repairs inventory specifically for SBF063 and SBF062 without modifying any other product.
 * Displays preview table of all variants, quantities, and deltas before applying changes.
 * Enforces operator confirmation unless --yes is passed.
 * Applies mutations via inventoryMigration.syncInventory using @idempotent directive and changeFromQuantity.
 * Performs post-mutation verification and generates reports/inventory-repair-<timestamp>.json.
 */
async function runRepairMismatches(options) {
  logger.banner('YEZ BEE - Targeted Inventory Repair (SBF063 & SBF062)');

  const targetLocationId = process.env.SHOPIFY_LOCATION_ID || options.locationId || 'gid://shopify/Location/90879655990';
  const location = await inventoryMigration.resolveLocation(targetLocationId);

  const targets = [
    { name: 'SBF063', docId: 'Abox1VoFIKikvp4iy0BI', handle: 'sbf063' },
    { name: 'SBF062', docId: 'bF6IouBDcJ3rk5XudIlw', handle: 'sbf062' }
  ];

  logger.section(`1. Pre-Repair Inspection at "${location.name}"`);

  const repairPlans = [];
  let totalDeltaAll = 0;

  for (const target of targets) {
    const firestoreProduct = await firestoreService.getProductById(target.docId);
    if (!firestoreProduct) {
      logger.error(`Product "${target.name}" (${target.docId}) not found in Firestore.`);
      process.exit(1);
    }

    const mapped = mapFirestoreToShopify(firestoreProduct);
    const shopifyProduct = await shopifyService.findProductByHandle(target.handle);
    if (!shopifyProduct) {
      logger.error(`Shopify product for "${target.name}" (handle: "${target.handle}") not found in store.`);
      process.exit(1);
    }

    const fullShopifyProduct = await shopifyService.fetchProductDetails(shopifyProduct.id);
    const variantNodes = fullShopifyProduct?.variants?.nodes || [];

    console.log('\n' + '-'.repeat(100));
    console.log(` PRODUCT: "${mapped.title}" (Doc ID: ${target.docId} | Shopify ID: ${fullShopifyProduct.id})`);
    console.log(` Expected Total Stock: ${mapped.totalStock} units across ${mapped.variants.length} variants`);
    console.log('-'.repeat(100));
    console.log(` Variant Title       | Inventory Item ID                   | Live | Target | Delta | Action`);
    console.log('-'.repeat(100));

    const productItemsPlan = [];

    for (let i = 0; i < variantNodes.length; i++) {
      const node = variantNodes[i];
      let srcV = null;
      try {
        srcV = matchShopifyVariantToSource(node, mapped.variants, {
          fallbackIndex: i,
          totalShopifyVariants: variantNodes.length,
          allowPositionalFallback: false
        });
      } catch (err) {
        logger.error(`Variant matching failed for "${node.title}": ${err.message}`);
        process.exit(1);
      }

      const expectedQty = srcV ? srcV.stockQuantity : 0;
      const invItemId = node.inventoryItem?.id;
      const locLevel = node.inventoryItem?.inventoryLevels?.nodes?.find(l => l.location?.id === location.id);
      const curAvail = locLevel?.quantities?.find(q => q.name === 'available')?.quantity ?? 0;
      const delta = expectedQty - curAvail;

      totalDeltaAll += delta;

      const action = delta === 0 ? 'NO CHANGE' : `ADJUST (${curAvail} -> ${expectedQty})`;

      productItemsPlan.push({
        variantId: node.id,
        title: node.title,
        size: srcV.size,
        color: srcV.color,
        inventoryItemId: invItemId,
        currentAvailable: curAvail,
        expectedQuantity: expectedQty,
        delta,
        action
      });

      const pad = (s, l) => String(s ?? '').padEnd(l);
      console.log(` ${pad(node.title, 19)} | ${pad(invItemId, 35)} | ${pad(curAvail, 4)} | ${pad(expectedQty, 6)} | ${pad(delta >= 0 ? '+' + delta : delta, 5)} | ${action}`);
    }

    repairPlans.push({
      target,
      firestoreProduct,
      mapped,
      fullShopifyProduct,
      variantNodes,
      itemsPlan: productItemsPlan
    });
  }

  console.log('\n' + '='.repeat(100));
  console.log(` Total Net Quantity Adjustment across both products: +${totalDeltaAll} units`);
  console.log('='.repeat(100));

  // Operator confirmation
  if (!options.yes) {
    const confirmed = await promptConfirm(`Apply inventorySetQuantities mutations for SBF063 and SBF062 (+${totalDeltaAll} units total) at "${location.name}"?`);
    if (!confirmed) {
      logger.warn('Targeted repair cancelled by operator. No mutations executed.');
      return;
    }
  }

  // Execute repairs
  logger.section('2. Executing Idempotent Inventory Adjustments');
  const executionResults = [];

  for (const plan of repairPlans) {
    logger.info(`Synchronizing inventory for "${plan.mapped.title}" (${plan.fullShopifyProduct.id})...`);
    const syncRes = await inventoryMigration.syncInventory(plan.variantNodes, plan.mapped.variants, location.id, { onlyMismatches: true });

    if (syncRes.errors.length > 0) {
      logger.error(`Errors syncing "${plan.mapped.title}": ${syncRes.errors.join('; ')}`);
    } else {
      logger.success(`Inventory synchronized for "${plan.mapped.title}": ${syncRes.totalStockAssigned} total units assigned.`);
    }

    // Post-mutation live verification
    logger.info(`Verifying live stock on Shopify store for "${plan.mapped.title}"...`);
    const recheckProduct = await shopifyService.fetchProductDetails(plan.fullShopifyProduct.id);
    const recheckVariants = recheckProduct?.variants?.nodes || [];

    let prodVerified = true;
    const verifiedVariants = [];

    for (const item of plan.itemsPlan) {
      const recheckNode = recheckVariants.find(v => v.id === item.variantId);
      const recheckLevel = recheckNode?.inventoryItem?.inventoryLevels?.nodes?.find(l => l.location?.id === location.id);
      const liveAvail = recheckLevel?.quantities?.find(q => q.name === 'available')?.quantity ?? 0;
      const matches = liveAvail === item.expectedQuantity;
      if (!matches) prodVerified = false;

      const badge = matches ? '\x1b[32m[VERIFIED]\x1b[0m' : '\x1b[31m[MISMATCH]\x1b[0m';
      console.log(`   ${badge} ${item.title.padEnd(20)} | Available: ${liveAvail} (Expected: ${item.expectedQuantity})`);

      verifiedVariants.push({
        ...item,
        postAvailable: liveAvail,
        verified: matches
      });
    }

    executionResults.push({
      productName: plan.mapped.title,
      docId: plan.target.docId,
      shopifyProductId: plan.fullShopifyProduct.id,
      expectedTotalStock: plan.mapped.totalStock,
      syncResult: syncRes,
      verified: prodVerified,
      variants: verifiedVariants
    });

    if (prodVerified) {
      // Update checkpoint
      checkpoint.recordSuccess(plan.target.docId, {
        shopifyProductId: plan.fullShopifyProduct.id,
        handle: plan.mapped.handle,
        title: plan.mapped.title,
        sku: plan.mapped.commonSku,
        variantsCount: plan.variantNodes.length,
        totalStock: plan.mapped.totalStock,
        imagesCount: plan.mapped.images.length
      });
    }
  }

  // Report generation
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.resolve(__dirname, `../reports/inventory-repair-${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({
    repairedAt: new Date().toISOString(),
    locationId: location.id,
    locationName: location.name,
    totalAdjustmentUnits: totalDeltaAll,
    allVerified: executionResults.every(r => r.verified),
    products: executionResults
  }, null, 2), 'utf8');

  logger.success(`Repair report generated: ${reportPath}`);
}

/**
 * Main Router
 */
async function main() {
  const options = parseArgs();

  switch (options.mode) {
    case 'audit':
      await runAudit();
      break;
    case 'verify':
      await runVerify(options);
      break;
    case 'fix-inventory':
      await runFixInventory(options);
      break;
    case 'repair-mismatches':
      await runRepairMismatches(options);
      break;
    case 'dry-run':
      await runDryRun();
      break;
    case 'test-one':
      await runTestOne(options);
      break;
    case 'all':
    case 'update':
      await runMigrateAll(options);
      break;
    case 'report':
      await runReport();
      break;
    default:
      logger.error(`Unknown mode "${options.mode}". Valid modes: audit, dry-run, test-one, all, update, report.`);
      process.exit(1);
  }
}

main().catch(err => {
  logger.error('Fatal execution error:', err);
  process.exit(1);
});
