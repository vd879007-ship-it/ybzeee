/**
 * Unit Test Suite for Variant Matcher Utility
 * Validates:
 * 1. Substring collision prevention across sizes (S, M, L, XL, 2XL, 3XL, XS)
 * 2. Multi-color products with identical sizes (3 colors x 3 sizes)
 * 3. Ambiguity rejection (never guess when color is omitted)
 * 4. SBF 014 exact regression mapping (Firestore 4 units vs Shopify 5 variants)
 * 5. Reverse matching for verification (matchSourceVariantToShopify)
 * 6. Positional fallback rejection invariants
 */

const assert = require('assert');
const {
  normalize,
  extractShopifyVariantOptions,
  matchShopifyVariantToSource,
  matchSourceVariantToShopify
} = require('../src/utils/variant-matcher');

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
console.log(' RUNNING VARIANT MATCHER UNIT TESTS');
console.log('='.repeat(80) + '\n');

// -------------------------------------------------------------
// Group 1: Substring Collision Prevention across Sizes
// -------------------------------------------------------------
console.log('--- Group 1: Substring Collision Prevention (XS, S, M, L, XL, 2XL, 3XL) ---');

const collisionSourceVariants = [
  { size: 'XS', color: 'Olive Green', stockQuantity: 10, sku: 'TEST-XS' },
  { size: 'S', color: 'Olive Green', stockQuantity: 20, sku: 'TEST-S' },
  { size: 'M', color: 'Olive Green', stockQuantity: 30, sku: 'TEST-M' },
  { size: 'L', color: 'Olive Green', stockQuantity: 40, sku: 'TEST-L' },
  { size: 'XL', color: 'Olive Green', stockQuantity: 50, sku: 'TEST-XL' },
  { size: '2XL', color: 'Olive Green', stockQuantity: 60, sku: 'TEST-2XL' },
  { size: '3XL', color: 'Olive Green', stockQuantity: 70, sku: 'TEST-3XL' }
];

test('Shopify "L" matches source "L" (stock 40) and never "XL", "2XL", "3XL"', () => {
  const shopifyNode = {
    id: 'gid://shopify/ProductVariant/104',
    title: 'Olive Green / L',
    selectedOptions: [
      { name: 'Color', value: 'Olive Green' },
      { name: 'Size', value: 'L' }
    ]
  };
  const matched = matchShopifyVariantToSource(shopifyNode, collisionSourceVariants);
  assert.strictEqual(matched.size, 'L');
  assert.strictEqual(matched.stockQuantity, 40);
});

test('Shopify "XL" matches source "XL" (stock 50) and never "L"', () => {
  const shopifyNode = {
    id: 'gid://shopify/ProductVariant/105',
    title: 'Olive Green / XL',
    selectedOptions: [
      { name: 'Color', value: 'Olive Green' },
      { name: 'Size', value: 'XL' }
    ]
  };
  const matched = matchShopifyVariantToSource(shopifyNode, collisionSourceVariants);
  assert.strictEqual(matched.size, 'XL');
  assert.strictEqual(matched.stockQuantity, 50);
});

test('Shopify "2XL" matches source "2XL" (stock 60) and never "L" or "XL"', () => {
  const shopifyNode = {
    id: 'gid://shopify/ProductVariant/106',
    title: 'Olive Green / 2XL',
    selectedOptions: [
      { name: 'Color', value: 'Olive Green' },
      { name: 'Size', value: '2XL' }
    ]
  };
  const matched = matchShopifyVariantToSource(shopifyNode, collisionSourceVariants);
  assert.strictEqual(matched.size, '2XL');
  assert.strictEqual(matched.stockQuantity, 60);
});

test('Shopify "3XL" matches source "3XL" (stock 70) and never "L" or "XL"', () => {
  const shopifyNode = {
    id: 'gid://shopify/ProductVariant/107',
    title: 'Olive Green / 3XL',
    selectedOptions: [
      { name: 'Color', value: 'Olive Green' },
      { name: 'Size', value: '3XL' }
    ]
  };
  const matched = matchShopifyVariantToSource(shopifyNode, collisionSourceVariants);
  assert.strictEqual(matched.size, '3XL');
  assert.strictEqual(matched.stockQuantity, 70);
});

test('Shopify "S" matches source "S" (stock 20) and never "XS"', () => {
  const shopifyNode = {
    id: 'gid://shopify/ProductVariant/102',
    title: 'Olive Green / S',
    selectedOptions: [
      { name: 'Color', value: 'Olive Green' },
      { name: 'Size', value: 'S' }
    ]
  };
  const matched = matchShopifyVariantToSource(shopifyNode, collisionSourceVariants);
  assert.strictEqual(matched.size, 'S');
  assert.strictEqual(matched.stockQuantity, 20);
});

test('Shopify "XS" matches source "XS" (stock 10) and never "S"', () => {
  const shopifyNode = {
    id: 'gid://shopify/ProductVariant/101',
    title: 'Olive Green / XS',
    selectedOptions: [
      { name: 'Color', value: 'Olive Green' },
      { name: 'Size', value: 'XS' }
    ]
  };
  const matched = matchShopifyVariantToSource(shopifyNode, collisionSourceVariants);
  assert.strictEqual(matched.size, 'XS');
  assert.strictEqual(matched.stockQuantity, 10);
});

test('Shopify "M" matches source "M" (stock 30)', () => {
  const shopifyNode = {
    id: 'gid://shopify/ProductVariant/103',
    title: 'Olive Green / M',
    selectedOptions: [
      { name: 'Color', value: 'Olive Green' },
      { name: 'Size', value: 'M' }
    ]
  };
  const matched = matchShopifyVariantToSource(shopifyNode, collisionSourceVariants);
  assert.strictEqual(matched.size, 'M');
  assert.strictEqual(matched.stockQuantity, 30);
});

test('Title fallback matches tokens without substring collision when selectedOptions is absent', () => {
  const nodeWithNoOptions = {
    id: 'gid://shopify/ProductVariant/999',
    title: 'Olive Green / 2XL' // title only
  };
  const matched = matchShopifyVariantToSource(nodeWithNoOptions, collisionSourceVariants);
  assert.strictEqual(matched.size, '2XL');
  assert.strictEqual(matched.stockQuantity, 60);
});

// -------------------------------------------------------------
// Group 2: Multiple Colors with Identical Sizes
// -------------------------------------------------------------
console.log('\n--- Group 2: Multiple Colors with Identical Sizes ---');

const multiColorSourceVariants = [
  { size: 'M', color: 'Black', stockQuantity: 5 },
  { size: 'L', color: 'Black', stockQuantity: 6 },
  { size: 'XL', color: 'Black', stockQuantity: 7 },
  { size: 'M', color: 'Navy', stockQuantity: 15 },
  { size: 'L', color: 'Navy', stockQuantity: 16 },
  { size: 'XL', color: 'Navy', stockQuantity: 17 },
  { size: 'M', color: 'Maroon', stockQuantity: 25 },
  { size: 'L', color: 'Maroon', stockQuantity: 26 },
  { size: 'XL', color: 'Maroon', stockQuantity: 27 }
];

test('Matches correct color and size among 9 multi-color variants (Navy / L)', () => {
  const shopifyNode = {
    id: 'gid://shopify/ProductVariant/navy-l',
    title: 'Navy / L',
    selectedOptions: [
      { name: 'Color', value: 'Navy' },
      { name: 'Size', value: 'L' }
    ]
  };
  const matched = matchShopifyVariantToSource(shopifyNode, multiColorSourceVariants);
  assert.strictEqual(matched.color, 'Navy');
  assert.strictEqual(matched.size, 'L');
  assert.strictEqual(matched.stockQuantity, 16);
});

test('Matches correct color and size among 9 multi-color variants (Maroon / XL)', () => {
  const shopifyNode = {
    id: 'gid://shopify/ProductVariant/maroon-xl',
    title: 'Maroon / XL',
    selectedOptions: [
      { name: 'Color', value: 'Maroon' },
      { name: 'Size', value: 'XL' }
    ]
  };
  const matched = matchShopifyVariantToSource(shopifyNode, multiColorSourceVariants);
  assert.strictEqual(matched.color, 'Maroon');
  assert.strictEqual(matched.size, 'XL');
  assert.strictEqual(matched.stockQuantity, 27);
});

test('Ambiguity check: Throws descriptive error if Color is omitted when multiple colors exist', () => {
  const ambiguousNode = {
    id: 'gid://shopify/ProductVariant/no-color-m',
    title: 'M',
    selectedOptions: [
      { name: 'Size', value: 'M' }
    ]
  };
  assert.throws(
    () => matchShopifyVariantToSource(ambiguousNode, multiColorSourceVariants),
    /Ambiguous variant match.*Exact Color option must be specified/
  );
});

test('Unmatched color throws error and never guesses', () => {
  const nonexistentColorNode = {
    id: 'gid://shopify/ProductVariant/yellow-m',
    title: 'Yellow / M',
    selectedOptions: [
      { name: 'Color', value: 'Yellow' },
      { name: 'Size', value: 'M' }
    ]
  };
  assert.throws(
    () => matchShopifyVariantToSource(nonexistentColorNode, multiColorSourceVariants),
    /No matching Firestore variant found/
  );
});

// -------------------------------------------------------------
// Group 3: SBF 014 Exact Regression Test
// -------------------------------------------------------------
console.log('\n--- Group 3: SBF 014 Exact Regression Test ---');

const sbf014SourceVariants = [
  { size: 'M', color: 'Blush Pink', stockQuantity: 1, sku: 'SBF 014' },
  { size: 'L', color: 'Blush Pink', stockQuantity: 0, sku: 'SBF 014' },
  { size: 'XL', color: 'Blush Pink', stockQuantity: 1, sku: 'SBF 014' },
  { size: '2XL', color: 'Blush Pink', stockQuantity: 1, sku: 'SBF 014' },
  { size: '3XL', color: 'Blush Pink', stockQuantity: 1, sku: 'SBF 014' }
];

const sbf014ShopifyNodes = [
  {
    id: 'gid://shopify/ProductVariant/48427055972406',
    title: 'Blush Pink / M',
    selectedOptions: [{ name: 'Color', value: 'Blush Pink' }, { name: 'Size', value: 'M' }]
  },
  {
    id: 'gid://shopify/ProductVariant/48427056005174',
    title: 'Blush Pink / L',
    selectedOptions: [{ name: 'Color', value: 'Blush Pink' }, { name: 'Size', value: 'L' }]
  },
  {
    id: 'gid://shopify/ProductVariant/48427056037942',
    title: 'Blush Pink / XL',
    selectedOptions: [{ name: 'Color', value: 'Blush Pink' }, { name: 'Size', value: 'XL' }]
  },
  {
    id: 'gid://shopify/ProductVariant/48427056070710',
    title: 'Blush Pink / 2XL',
    selectedOptions: [{ name: 'Color', value: 'Blush Pink' }, { name: 'Size', value: '2XL' }]
  },
  {
    id: 'gid://shopify/ProductVariant/48427056103478',
    title: 'Blush Pink / 3XL',
    selectedOptions: [{ name: 'Color', value: 'Blush Pink' }, { name: 'Size', value: '3XL' }]
  }
];

test('SBF 014: All 5 variants map to expected stock (1, 0, 1, 1, 1 -> Total = 4)', () => {
  const mappedStock = sbf014ShopifyNodes.map(node => {
    const matched = matchShopifyVariantToSource(node, sbf014SourceVariants);
    return { title: node.title, stock: matched.stockQuantity };
  });

  assert.deepStrictEqual(mappedStock, [
    { title: 'Blush Pink / M', stock: 1 },
    { title: 'Blush Pink / L', stock: 0 },
    { title: 'Blush Pink / XL', stock: 1 },
    { title: 'Blush Pink / 2XL', stock: 1 },
    { title: 'Blush Pink / 3XL', stock: 1 }
  ]);

  const totalStock = mappedStock.reduce((acc, curr) => acc + curr.stock, 0);
  assert.strictEqual(totalStock, 4);
});

// -------------------------------------------------------------
// Group 4: Bidirectional Verification Matching (matchSourceVariantToShopify)
// -------------------------------------------------------------
console.log('\n--- Group 4: Bidirectional Verification Matching ---');

test('Reverse matching finds correct Shopify variant node for each source variant', () => {
  sbf014SourceVariants.forEach(srcV => {
    const matchedNode = matchSourceVariantToShopify(srcV, sbf014ShopifyNodes);
    assert.strictEqual(matchedNode.title, `Blush Pink / ${srcV.size}`);
  });
});

test('Reverse matching throws error when Shopify node is missing for a source size', () => {
  const missingSourceVariant = { size: '4XL', color: 'Blush Pink' };
  assert.throws(
    () => matchSourceVariantToShopify(missingSourceVariant, sbf014ShopifyNodes),
    /No matching Shopify variant found/
  );
});

// -------------------------------------------------------------
// Group 5: Positional Fallback Invariants
// -------------------------------------------------------------
console.log('\n--- Group 5: Positional Fallback Safety Invariants ---');

test('Rejects positional fallback if target size is not found in source variants', () => {
  const unknownSizeNode = {
    id: 'gid://shopify/ProductVariant/bad-size',
    title: 'Blush Pink / 4XL',
    selectedOptions: [{ name: 'Color', value: 'Blush Pink' }, { name: 'Size', value: '4XL' }]
  };

  assert.throws(
    () => matchShopifyVariantToSource(unknownSizeNode, sbf014SourceVariants, {
      fallbackIndex: 2,
      totalShopifyVariants: 5,
      allowPositionalFallback: true
    }),
    /Positional fallback rejected to prevent invalid stock mapping/
  );
});

console.log('\n' + '='.repeat(80));
console.log(` RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('='.repeat(80) + '\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
