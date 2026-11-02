/**
 * Shopify & Firebase Diagnostic and Connection Test Script
 * Verifies credentials, OAuth / Client Credentials authentication, API permissions, and store locations.
 * 
 * Usage:
 *   npm run test:shopify
 *   node test-shopify.js
 */

const dotenv = require('dotenv');
const logger = require('./src/utils/logger');
const { validateFirebaseConnection } = require('./src/config/firebase');
const { validateShopifyConfig, getShopDomain, getAccessToken, getApiVersion } = require('./src/config/shopify');
const shopifyService = require('./src/services/shopify.service');

dotenv.config();

async function runDiagnostics() {
  logger.banner('YEZ BEE - Shopify & Firebase Integration Diagnostics');

  let allPassed = true;

  // 1. Environment Variables Validation
  logger.section('1. Environment Variables Validation');
  const shopifyValidation = validateShopifyConfig();

  if (!shopifyValidation.valid) {
    logger.warn('Shopify configuration warning in .env:');
    shopifyValidation.errors.forEach(err => console.log(`   - ${err}`));
  } else {
    logger.success('Shopify environment configuration is present.');
  }

  // 2. Firebase Connection Test
  logger.section('2. Firebase Firestore Connection (africa-south1)');
  const firebaseRes = await validateFirebaseConnection();
  if (firebaseRes.success) {
    logger.success(`Firebase connected successfully! Project ID: "${firebaseRes.projectId}"`);
    logger.info(`Sample Firestore document probe: ${firebaseRes.sampleFound ? 'Found' : 'Collection empty'}`);
  } else {
    logger.error('Firebase connection failed:', firebaseRes.error);
    allPassed = false;
  }

  // 3. Shopify Authentication & GraphQL Verification
  logger.section('3. Shopify Admin API Connection & Authentication');
  let shopDomain = '';
  try {
    shopDomain = getShopDomain();
    logger.info(`Target Shopify Store: https://${shopDomain}`);
    logger.info(`Shopify API Version: ${getApiVersion()}`);
  } catch (err) {
    logger.error('Invalid SHOPIFY_SHOP in .env:', err.message);
    allPassed = false;
    return;
  }

  try {
    logger.info('Authenticating and querying Shopify Admin GraphQL API...');
    const shop = await shopifyService.testConnection();

    logger.success(`Shopify connected successfully!`);
    console.log(`   Store Name:      ${shop.name}`);
    console.log(`   Store Domain:    ${shop.myshopifyDomain}`);
    console.log(`   Currency:        ${shop.currencyCode}`);
    console.log(`   Shopify Plan:    ${shop.plan?.displayName || 'Standard'}`);
    console.log(`   Contact Email:   ${shop.email || 'N/A'}`);

    // 4. Retrieve Active Inventory Locations
    logger.section('4. Shopify Inventory Locations');
    const locations = await shopifyService.getLocations();

    if (locations.length === 0) {
      logger.warn('No active inventory locations found. Please ensure at least one location exists in Shopify Admin Settings -> Locations.');
    } else {
      logger.success(`Found ${locations.length} active location(s):`);
      locations.forEach((loc, index) => {
        const address = loc.address ? `${loc.address.city || ''}, ${loc.address.country || ''}`.trim() : '';
        console.log(`   [${index + 1}] "${loc.name}" (ID: ${loc.id}) ${address ? `[${address}]` : ''}`);
      });
      console.log(`\n   TIP: You can set SHOPIFY_LOCATION_ID=${locations[0].id} in .env to specify a preferred location.`);
    }

  } catch (err) {
    allPassed = false;
    logger.error(`Shopify connection failed: ${err.message}`);

    if (err.code === 'SHOP_NOT_PERMITTED') {
      console.log('\n[RECOVERY INSTRUCTIONS]');
      console.log('The Client Credentials grant is only allowed if the Dev App and the Store share the same Partner Org.');
      console.log('To connect your store directly without organization restrictions:');
      console.log('1. Go to: https://' + shopDomain + '/admin/settings/apps/development');
      console.log('2. Click "Create an app" -> Name: "Yezbee Data Migration"');
      console.log('3. Under "API credentials" / "Configuration", enable scopes:');
      console.log('   - write_products, read_products');
      console.log('   - write_inventory, read_inventory');
      console.log('   - read_locations');
      console.log('4. Click "Install app" -> Copy the Admin API access token (shpat_...)');
      console.log('5. Paste into your .env file:');
      console.log('   SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_your_token_here\n');
    }
  }

  // Final Summary
  logger.section('Summary & Next Steps');
  if (allPassed) {
    logger.success('All integration checks PASSED! You are ready to run:');
    console.log('   1. Preview products:      npm run preview');
    console.log('   2. Test migrate 1 item:   npm run migrate:test');
    console.log('   3. Run full migration:    npm run migrate:all\n');
  } else {
    logger.warn('Please resolve the errors above before running migration scripts.\n');
  }
}

runDiagnostics().catch(err => {
  logger.error('Unexpected error during diagnostics:', err);
  process.exit(1);
});
