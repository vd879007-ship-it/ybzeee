const dotenv = require('dotenv');
const path = require('path');
const assert = require('assert');

// Load environment from yezbee-frontend/.env.local
dotenv.config({ path: path.resolve(__dirname, '../yezbee-frontend/.env.local') });

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || 'yezbee-fashion-skmumi5z.myshopify.com';
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-10';

const ENDPOINT = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`;

async function executeGraphQL(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
      'Accept': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(`GraphQL Error: ${json.errors.map(e => e.message).join('; ')}`);
  }

  return json.data;
}

// Exact variant matcher logic
function matchExactVariant(variants, size, color) {
  if (!variants || variants.length === 0) return undefined;
  const targetSize = size ? size.trim().toUpperCase() : '';
  const targetColor = color ? color.trim().toUpperCase() : '';

  if (targetColor) {
    const match = variants.find(v => {
      const vSize = (v.size || '').trim().toUpperCase();
      const vColor = (v.color || '').trim().toUpperCase();
      return vSize === targetSize && vColor === targetColor;
    });
    if (match) return match;
  }

  return variants.find(v => (v.size || '').trim().toUpperCase() === targetSize);
}

async function runTests() {
  console.log('====================================================');
  console.log('YEZ BEE SHOPIFY STOREFRONT INTEGRATION TEST SUITE');
  console.log('====================================================');

  // Test 1: Configuration
  console.log('\n[TEST 1] Verifying Environment Configuration...');
  assert.strictEqual(DOMAIN, 'yezbee-fashion-skmumi5z.myshopify.com', 'Domain must match');
  assert(TOKEN && TOKEN.length > 20, 'Public Storefront Token must be present');
  assert.strictEqual(API_VERSION, '2026-10', 'API Version must be 2026-10');
  console.log('PASS: Environment variables valid & loaded from .env.local');

  // Test 2: Connection to Shopify Storefront API
  console.log('\n[TEST 2] Testing Storefront API Connection & Authentication...');
  const shopData = await executeGraphQL(`{ shop { name primaryDomain { host } } }`);
  assert(shopData?.shop?.name, 'Shop name must be returned');
  console.log(`PASS: Connected to shop "${shopData.shop.name}" at ${shopData.shop.primaryDomain?.host}`);

  // Test 3: Exact Variant Matcher Unit Tests
  console.log('\n[TEST 3] Running Exact Variant Matching Tests...');
  const testVariants = [
    { id: 'gid://1', size: 'XS', color: 'Blue', stock: 5 },
    { id: 'gid://2', size: 'S', color: 'Blue', stock: 10 },
    { id: 'gid://3', size: 'M', color: 'Blue', stock: 8 },
    { id: 'gid://4', size: 'L', color: 'Blue', stock: 0 },
    { id: 'gid://5', size: 'XL', color: 'Blue', stock: 12 },
    { id: 'gid://6', size: '2XL', color: 'Blue', stock: 4 },
    { id: 'gid://7', size: '3XL', color: 'Blue', stock: 2 },
    { id: 'gid://8', size: 'M', color: 'Red', stock: 7 },
    { id: 'gid://9', size: 'XL', color: 'Red', stock: 9 }
  ];

  // Test XS vs S vs 2XL vs 3XL vs XL isolation (prevents substring collision)
  assert.strictEqual(matchExactVariant(testVariants, 'S', 'Blue')?.id, 'gid://2', 'Size S must not match XS or 2XL');
  assert.strictEqual(matchExactVariant(testVariants, 'XS', 'Blue')?.id, 'gid://1', 'Size XS must match exact XS');
  assert.strictEqual(matchExactVariant(testVariants, 'XL', 'Blue')?.id, 'gid://5', 'Size XL must not match 2XL or 3XL');
  assert.strictEqual(matchExactVariant(testVariants, '2XL', 'Blue')?.id, 'gid://6', 'Size 2XL must match exact 2XL');
  assert.strictEqual(matchExactVariant(testVariants, '3XL', 'Blue')?.id, 'gid://7', 'Size 3XL must match exact 3XL');
  
  // Test color differentiation with same size
  assert.strictEqual(matchExactVariant(testVariants, 'M', 'Red')?.id, 'gid://8', 'Size M Red must match gid://8');
  assert.strictEqual(matchExactVariant(testVariants, 'M', 'Blue')?.id, 'gid://3', 'Size M Blue must match gid://3');

  // Test out-of-stock variant detection
  const outOfStockVariant = matchExactVariant(testVariants, 'L', 'Blue');
  assert.strictEqual(outOfStockVariant?.stock, 0, 'Size L stock must be 0');
  console.log('PASS: Exact variant matcher unit tests (7 sizes & 2 colors) passed with 100% precision.');

  // Test 4: Shopify Cart API (cartCreate mutation)
  console.log('\n[TEST 4] Testing Shopify Storefront Cart API (cartCreate)...');
  const cartMutation = `
    mutation CreateTestCart {
      cartCreate(input: {}) {
        cart {
          id
          checkoutUrl
          totalQuantity
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const cartResult = await executeGraphQL(cartMutation);
  const cart = cartResult?.cartCreate?.cart;
  const userErrors = cartResult?.cartCreate?.userErrors;

  assert(!userErrors || userErrors.length === 0, `cartCreate userErrors: ${JSON.stringify(userErrors)}`);
  assert(cart && cart.id, 'Cart ID must be returned');
  assert(cart.checkoutUrl && cart.checkoutUrl.startsWith('https://'), 'Checkout URL must be a valid HTTPS URL');
  console.log(`PASS: Shopify Cart created successfully.`);
  console.log(` - Cart ID: ${cart.id.slice(0, 30)}...`);
  console.log(` - Checkout URL generated: ${cart.checkoutUrl.split('?')[0]}`);
  console.log(` - Initial Total Quantity: ${cart.totalQuantity}`);

  console.log('\n====================================================');
  console.log('ALL INTEGRATION TESTS PASSED SUCCESSFULLY! (4/4)');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\nFAIL: Integration test failed:', err);
  process.exit(1);
});
