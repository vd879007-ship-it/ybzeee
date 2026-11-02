/**
 * Unit Test Suite for Verification Service
 * Validates:
 * 1. Single product verification - Full match PASS
 * 2. Zero-images handling - Warning, not failure
 * 3. Skipped Base64 images handling - Warning, not failure
 * 4. Missing variant detection - FAIL
 * 5. Extra variant detection - FAIL
 * 6. Inventory quantity mismatch detection - FAIL
 * 7. Price / SKU mismatch detection - FAIL
 * 8. Metafield custom.firestore_id mismatch detection - FAIL
 * 9. Multi-layered indexing and duplicate Shopify product detection
 */

const assert = require('assert');
const verificationService = require('../src/services/verification.service');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${name}`);
  } catch (err) {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('\n' + '='.repeat(80));
console.log(' RUNNING VERIFICATION SERVICE UNIT TESTS');
console.log('='.repeat(80) + '\n');

// -------------------------------------------------------------
// Sample Fixture Data
// -------------------------------------------------------------
const sampleFirestoreProduct = {
  id: 'doc-sbf-001',
  name: 'SBF 001',
  slug: 'sbf-001',
  brand: 'YEZ BEE',
  categoryName: 'Maternity',
  status: 'PUBLISHED',
  isActive: true,
  price: 999,
  compareAtPrice: 1499,
  stock: 3,
  description: 'Pure cotton maternity dress',
  fabric: '100% Pure Cotton',
  fit: 'Relaxed Fit',
  occasion: 'Casual',
  pattern: 'Solid',
  feedingFriendly: true,
  maternity: true,
  careInstructions: ['Hand wash cold'],
  images: [
    'https://res.cloudinary.com/demo/image/upload/v1/sbf001-1.jpg',
    'https://res.cloudinary.com/demo/image/upload/v1/sbf001-2.jpg'
  ],
  variants: [
    { size: 'M', color: 'Blush Pink', sku: 'SBF 001', price: 999, compareAtPrice: 1499, stock: 1 },
    { size: 'L', color: 'Blush Pink', sku: 'SBF 001', price: 999, compareAtPrice: 1499, stock: 0 },
    { size: 'XL', color: 'Blush Pink', sku: 'SBF 001', price: 999, compareAtPrice: 1499, stock: 2 }
  ]
};

const sampleShopifyProduct = {
  id: 'gid://shopify/Product/1001',
  title: 'SBF 001',
  handle: 'sbf-001',
  status: 'ACTIVE',
  vendor: 'YEZ BEE',
  productType: 'Maternity',
  media: {
    nodes: [
      { id: 'gid://shopify/MediaImage/1', alt: 'SBF 001 - Image 1' },
      { id: 'gid://shopify/MediaImage/2', alt: 'SBF 001 - Image 2' }
    ]
  },
  metafields: {
    nodes: [
      { namespace: 'custom', key: 'firestore_id', value: 'doc-sbf-001' },
      { namespace: 'custom', key: 'original_slug', value: 'sbf-001' },
      { namespace: 'custom', key: 'fabric', value: '100% Pure Cotton' },
      { namespace: 'custom', key: 'fit', value: 'Relaxed Fit' },
      { namespace: 'custom', key: 'occasion', value: 'Casual' },
      { namespace: 'custom', key: 'pattern', value: 'Solid' },
      { namespace: 'custom', key: 'feeding_friendly', value: 'true' },
      { namespace: 'custom', key: 'maternity', value: 'true' },
      { namespace: 'custom', key: 'care_instructions', value: '["Hand wash cold"]' }
    ]
  },
  variants: {
    nodes: [
      {
        id: 'gid://shopify/ProductVariant/v-m',
        title: 'Blush Pink / M',
        sku: 'SBF 001',
        price: '999.00',
        compareAtPrice: '1499.00',
        selectedOptions: [{ name: 'Color', value: 'Blush Pink' }, { name: 'Size', value: 'M' }],
        inventoryItem: {
          id: 'gid://shopify/InventoryItem/inv-m',
          inventoryLevels: {
            nodes: [
              {
                location: { id: 'gid://shopify/Location/90879655990' },
                quantities: [{ name: 'available', quantity: 1 }]
              }
            ]
          }
        }
      },
      {
        id: 'gid://shopify/ProductVariant/v-l',
        title: 'Blush Pink / L',
        sku: 'SBF 001',
        price: '999.00',
        compareAtPrice: '1499.00',
        selectedOptions: [{ name: 'Color', value: 'Blush Pink' }, { name: 'Size', value: 'L' }],
        inventoryItem: {
          id: 'gid://shopify/InventoryItem/inv-l',
          inventoryLevels: {
            nodes: [
              {
                location: { id: 'gid://shopify/Location/90879655990' },
                quantities: [{ name: 'available', quantity: 0 }]
              }
            ]
          }
        }
      },
      {
        id: 'gid://shopify/ProductVariant/v-xl',
        title: 'Blush Pink / XL',
        sku: 'SBF 001',
        price: '999.00',
        compareAtPrice: '1499.00',
        selectedOptions: [{ name: 'Color', value: 'Blush Pink' }, { name: 'Size', value: 'XL' }],
        inventoryItem: {
          id: 'gid://shopify/InventoryItem/inv-xl',
          inventoryLevels: {
            nodes: [
              {
                location: { id: 'gid://shopify/Location/90879655990' },
                quantities: [{ name: 'available', quantity: 2 }]
              }
            ]
          }
        }
      }
    ]
  }
};

// -------------------------------------------------------------
// Group 1: Ideal PASS Case
// -------------------------------------------------------------
console.log('--- Group 1: Ideal PASS Case ---');

test('Fully matching product passes 100% of checks', () => {
  const result = verificationService.verifyProduct(sampleFirestoreProduct, sampleShopifyProduct, {
    locationId: 'gid://shopify/Location/90879655990'
  });

  assert.strictEqual(result.status, 'PASS');
  assert.strictEqual(result.overallPassed, true);
  assert.strictEqual(result.errors.length, 0);
  assert.strictEqual(result.expectedTotalStock, 3);
  assert.strictEqual(result.shopifyTotalStock, 3);
  assert.strictEqual(result.variantChecks.length, 3);
  assert.strictEqual(result.variantChecks.every(v => v.status === 'PASS'), true);
});

// -------------------------------------------------------------
// Group 2: Image Warnings vs Failures
// -------------------------------------------------------------
console.log('\n--- Group 2: Image Warnings vs Failures ---');

test('Product with zero images in Firestore passes verification with a warning (not failure)', () => {
  const zeroImageDoc = {
    ...sampleFirestoreProduct,
    id: 'doc-no-img',
    images: []
  };
  const zeroImageShopify = {
    ...sampleShopifyProduct,
    media: { nodes: [] },
    metafields: {
      nodes: sampleShopifyProduct.metafields.nodes.map(m => 
        m.key === 'firestore_id' ? { ...m, value: 'doc-no-img' } : m
      )
    }
  };

  const result = verificationService.verifyProduct(zeroImageDoc, zeroImageShopify, {
    locationId: 'gid://shopify/Location/90879655990'
  });

  assert.strictEqual(result.status, 'PASS');
  assert.strictEqual(result.overallPassed, true);
  assert.strictEqual(result.warnings.some(w => w.includes('0 images')), true);
});

test('Product with skipped Base64 data URIs passes verification with a warning (not failure)', () => {
  const base64Doc = {
    ...sampleFirestoreProduct,
    images: [
      'https://res.cloudinary.com/demo/image/upload/v1/valid.jpg',
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...' // skipped
    ]
  };
  const base64Shopify = {
    ...sampleShopifyProduct,
    media: {
      nodes: [{ id: 'gid://shopify/MediaImage/valid' }] // exactly 1 Cloudinary image
    }
  };

  const result = verificationService.verifyProduct(base64Doc, base64Shopify, {
    locationId: 'gid://shopify/Location/90879655990'
  });

  assert.strictEqual(result.status, 'PASS');
  assert.strictEqual(result.warnings.some(w => w.includes('Base64')), true);
});

// -------------------------------------------------------------
// Group 3: Discrepancy & Failure Detection
// -------------------------------------------------------------
console.log('\n--- Group 3: Discrepancy & Failure Detection ---');

test('Detects inventory stock quantity discrepancy', () => {
  const badStockShopify = JSON.parse(JSON.stringify(sampleShopifyProduct));
  // Change XL stock from 2 to 0
  badStockShopify.variants.nodes[2].inventoryItem.inventoryLevels.nodes[0].quantities[0].quantity = 0;

  const result = verificationService.verifyProduct(sampleFirestoreProduct, badStockShopify, {
    locationId: 'gid://shopify/Location/90879655990'
  });

  assert.strictEqual(result.status, 'FAIL');
  assert.strictEqual(result.overallPassed, false);
  assert.strictEqual(result.errors.some(e => e.includes('Stock mismatch')), true);
  assert.strictEqual(result.shopifyTotalStock, 1);
  assert.strictEqual(result.stockDelta, 2);
});

test('Detects price discrepancy on variant', () => {
  const badPriceShopify = JSON.parse(JSON.stringify(sampleShopifyProduct));
  badPriceShopify.variants.nodes[0].price = '799.00'; // expected 999.00

  const result = verificationService.verifyProduct(sampleFirestoreProduct, badPriceShopify, {
    locationId: 'gid://shopify/Location/90879655990'
  });

  assert.strictEqual(result.status, 'FAIL');
  assert.strictEqual(result.errors.some(e => e.includes('Price mismatch')), true);
});

test('Detects missing variant in Shopify', () => {
  const missingVarShopify = JSON.parse(JSON.stringify(sampleShopifyProduct));
  // Remove variant XL
  missingVarShopify.variants.nodes.pop();

  const result = verificationService.verifyProduct(sampleFirestoreProduct, missingVarShopify, {
    locationId: 'gid://shopify/Location/90879655990'
  });

  assert.strictEqual(result.status, 'FAIL');
  assert.strictEqual(result.variantChecks.some(v => v.status === 'MISSING'), true);
});

test('Detects extra variant in Shopify not present in Firestore', () => {
  const extraVarShopify = JSON.parse(JSON.stringify(sampleShopifyProduct));
  // Add extra variant 4XL
  extraVarShopify.variants.nodes.push({
    id: 'gid://shopify/ProductVariant/v-4xl',
    title: 'Blush Pink / 4XL',
    sku: 'SBF 001',
    price: '999.00',
    selectedOptions: [{ name: 'Color', value: 'Blush Pink' }, { name: 'Size', value: '4XL' }]
  });

  const result = verificationService.verifyProduct(sampleFirestoreProduct, extraVarShopify, {
    locationId: 'gid://shopify/Location/90879655990'
  });

  assert.strictEqual(result.status, 'FAIL');
  assert.strictEqual(result.extraVariants.length, 1);
  assert.strictEqual(result.errors.some(e => e.includes('Extra variant')), true);
});

test('Detects custom.firestore_id metafield mismatch', () => {
  const badMetaShopify = JSON.parse(JSON.stringify(sampleShopifyProduct));
  const fIdMeta = badMetaShopify.metafields.nodes.find(m => m.key === 'firestore_id');
  fIdMeta.value = 'wrong-doc-id';

  const result = verificationService.verifyProduct(sampleFirestoreProduct, badMetaShopify, {
    locationId: 'gid://shopify/Location/90879655990'
  });

  assert.strictEqual(result.status, 'FAIL');
  assert.strictEqual(result.errors.some(e => e.includes('firestore_id')), true);
});

// -------------------------------------------------------------
// Group 4: Indexing and Duplicate Product Detection
// -------------------------------------------------------------
console.log('\n--- Group 4: Indexing & Duplicate Shopify Detection ---');

test('buildShopifyIndex correctly detects duplicate Shopify products sharing same firestore_id', () => {
  const duplicateShopifyList = [
    {
      id: 'gid://shopify/Product/1',
      title: 'SBF 001 Copy 1',
      handle: 'sbf-001',
      metafields: { nodes: [{ namespace: 'custom', key: 'firestore_id', value: 'doc-123' }] }
    },
    {
      id: 'gid://shopify/Product/2',
      title: 'SBF 001 Copy 2',
      handle: 'sbf-001-dup',
      metafields: { nodes: [{ namespace: 'custom', key: 'firestore_id', value: 'doc-123' }] }
    }
  ];

  const index = verificationService.buildShopifyIndex(duplicateShopifyList);
  assert.strictEqual(index.duplicateShopifyProducts.length, 1);
  assert.strictEqual(index.duplicateShopifyProducts[0].type, 'duplicate_firestore_id');
  assert.strictEqual(index.duplicateShopifyProducts[0].firestoreDocId, 'doc-123');
});

console.log('\n' + '='.repeat(80));
console.log(` RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('='.repeat(80) + '\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
