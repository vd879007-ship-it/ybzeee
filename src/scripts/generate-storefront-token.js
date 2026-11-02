const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { getAccessToken, getGraphqlEndpoint, getShopDomain, getApiVersion } = require('../config/shopify');
const shopifyService = require('../services/shopify.service');

async function checkScopes() {
  console.log('--- Checking current Shopify App installation and scopes ---');
  const query = `
    query CurrentAppScopes {
      currentAppInstallation {
        id
        accessScopes {
          handle
        }
      }
    }
  `;

  try {
    const data = await shopifyService.executeGraphQL(query);
    const scopes = data?.currentAppInstallation?.accessScopes?.map(s => s.handle) || [];
    console.log(`Current App Scopes count: ${scopes.length}`);
    console.log(`Scopes: ${scopes.join(', ')}`);
    return scopes;
  } catch (err) {
    console.warn(`Could not query currentAppInstallation: ${err.message}`);
    return [];
  }
}

async function checkExistingStorefrontTokens() {
  console.log('--- Checking existing Storefront Access Tokens ---');
  const query = `
    query GetStorefrontTokens {
      shop {
        name
        myshopifyDomain
      }
    }
  `;
  try {
    const data = await shopifyService.executeGraphQL(query);
    console.log(`Connected to shop: ${data?.shop?.name} (${data?.shop?.myshopifyDomain})`);
  } catch (err) {
    console.error(`Failed to connect to shop: ${err.message}`);
    throw err;
  }
}

async function createStorefrontToken() {
  console.log('--- Executing storefrontAccessTokenCreate mutation ---');
  const mutation = `
    mutation CreateStorefrontToken($input: StorefrontAccessTokenInput!) {
      storefrontAccessTokenCreate(input: $input) {
        storefrontAccessToken {
          id
          title
          accessToken
          createdAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      title: 'YEZ BEE Next.js Storefront'
    }
  };

  try {
    const data = await shopifyService.executeGraphQL(mutation, variables);
    const result = data?.storefrontAccessTokenCreate;

    if (result?.userErrors && result.userErrors.length > 0) {
      console.error('Storefront token creation userErrors:');
      result.userErrors.forEach(err => console.error(` - [${err.field}]: ${err.message}`));
      return null;
    }

    const tokenObj = result?.storefrontAccessToken;
    if (!tokenObj || !tokenObj.accessToken || typeof tokenObj.accessToken !== 'string') {
      console.error('No accessToken returned in response.');
      return null;
    }

    const token = tokenObj.accessToken.trim();
    console.log(`Storefront Access Token successfully generated!`);
    console.log(`Token Title: "${tokenObj.title}"`);
    console.log(`Token ID: ${tokenObj.id}`);
    console.log(`Token validated: non-empty string, length: ${token.length}`);
    // NOTE: NEVER print the actual token to terminal!

    return token;
  } catch (err) {
    console.error(`storefrontAccessTokenCreate failed: ${err.message}`);
    return null;
  }
}

async function main() {
  try {
    const shopDomain = getShopDomain();
    const apiVersion = getApiVersion();
    console.log(`Target Shop: ${shopDomain}`);
    console.log(`API Version: ${apiVersion}`);

    const scopes = await checkScopes();
    await checkExistingStorefrontTokens();

    const token = await createStorefrontToken();

    if (!token) {
      console.error('\nFAILED: Could not generate Storefront Access Token.');
      process.exit(1);
    }

    // Write to yezbee-frontend/.env.local securely
    const frontendEnvPath = path.resolve(__dirname, '../../../yezbee-frontend/.env.local');
    const envContent = [
      `# Shopify Storefront Configuration for YEZ BEE Next.js 14`,
      `SHOPIFY_STORE_DOMAIN=${shopDomain}`,
      `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=${token}`,
      `SHOPIFY_API_VERSION=${apiVersion}`,
      ``
    ].join('\n');

    fs.writeFileSync(frontendEnvPath, envContent, 'utf8');
    console.log(`\nSecurely written storefront config to: ${frontendEnvPath}`);
    console.log(`File exists: ${fs.existsSync(frontendEnvPath)} (size: ${fs.statSync(frontendEnvPath).size} bytes)`);

  } catch (err) {
    console.error('Fatal error in main:', err.message);
    process.exit(1);
  }
}

main();
