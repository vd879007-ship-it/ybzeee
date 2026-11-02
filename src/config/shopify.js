/**
 * Shopify Configuration & OAuth / Client Credentials Token Manager
 * Securely manages credentials, generates and renews Admin API access tokens.
 */

const dotenv = require('dotenv');
const logger = require('../utils/logger');

dotenv.config();

// Token cache state
let cachedAccessToken = null;
let tokenExpiresAt = null;

/**
 * Normalizes shop domain to ensure it ends with .myshopify.com
 * @param {string} rawShop 
 * @returns {string} E.g. yezbee-fashion-skmumi5z.myshopify.com
 */
function normalizeShopDomain(rawShop) {
  if (!rawShop) return '';
  let shop = rawShop.trim().toLowerCase();
  shop = shop.replace(/^https?:\/\//, '');
  shop = shop.replace(/\/.*$/, '');
  if (!shop.includes('.')) {
    shop = `${shop}.myshopify.com`;
  }
  return shop;
}

/**
 * Gets normalized shop domain
 * @returns {string}
 */
function getShopDomain() {
  const shop = process.env.SHOPIFY_SHOP;
  if (!shop) {
    throw new Error('SHOPIFY_SHOP environment variable is missing in .env.');
  }
  return normalizeShopDomain(shop);
}

/**
 * Gets Shopify API version
 * @returns {string} E.g. '2026-10'
 */
function getApiVersion() {
  return process.env.SHOPIFY_API_VERSION || '2026-10';
}

/**
 * Gets GraphQL endpoint URL
 * @returns {string}
 */
function getGraphqlEndpoint() {
  const domain = getShopDomain();
  const version = getApiVersion();
  return `https://${domain}/admin/api/${version}/graphql.json`;
}

/**
 * Obtains an Admin API access token using Shopify Client Credentials Grant
 * or uses SHOPIFY_ADMIN_ACCESS_TOKEN if directly configured.
 * Automatically renews when expired (tokens expire after 24 hours).
 * 
 * @param {boolean} forceRefresh Force token regeneration
 * @returns {Promise<string>} Valid Admin API access token
 */
async function getAccessToken(forceRefresh = false) {
  // If direct Admin API Access Token is provided (e.g. from Custom App in Shopify Admin), use it
  if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN.trim().length > 0) {
    return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN.trim();
  }

  // Check cache (with 5 minute safety buffer before 24h expiration)
  const now = Date.now();
  if (!forceRefresh && cachedAccessToken && tokenExpiresAt && now < tokenExpiresAt - 300000) {
    return cachedAccessToken;
  }

  const shopDomain = getShopDomain();
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing Shopify authentication credentials.\n' +
      'Please specify SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET (or SHOPIFY_ADMIN_ACCESS_TOKEN) in your .env file.'
    );
  }

  const tokenUrl = `https://${shopDomain}/admin/oauth/access_token`;
  logger.info(`Requesting Shopify Admin API access token via Client Credentials Grant...`);

  let response;
  let json;

  try {
    response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });

    json = await response.json();
  } catch (err) {
    logger.error('Failed to communicate with Shopify OAuth endpoint', err);
    throw new Error(`Failed to contact Shopify OAuth endpoint: ${err.message}`);
  }

  if (!response.ok || json.error) {
    const errorType = json.error || 'authentication_error';
    const errorDesc = json.error_description || response.statusText;

    // Specific handling for shop_not_permitted as required by specification
    if (errorType === 'shop_not_permitted') {
      const explanation = 
        `\n================================================================================\n` +
        `[SHOPIFY AUTHENTICATION ERROR: shop_not_permitted]\n` +
        `================================================================================\n` +
        `Shopify rejected the Client Credentials Grant because the app (Client ID: ${clientId})\n` +
        `and the store (${shopDomain}) do not belong to the same Shopify Partner Organization.\n\n` +
        `HOW TO FIX THIS:\n` +
        `Option 1 (Recommended for standalone stores):\n` +
        `  1. Open your Shopify Admin: https://${shopDomain}/admin\n` +
        `  2. Go to Settings -> Apps and sales channels -> Develop apps\n` +
        `  3. Click "Create an app" (e.g. named "Yezbee Data Migration")\n` +
        `  4. Under "Configuration" -> "Admin API integration", grant scopes:\n` +
        `       - write_products, read_products\n` +
        `       - write_inventory, read_inventory\n` +
        `       - read_locations\n` +
        `       - write_files, read_files\n` +
        `  5. Click "Install app", then reveal and copy the Admin API access token (starts with shpat_).\n` +
        `  6. Paste it into your .env file:\n` +
        `       SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxx\n\n` +
        `Option 2 (Partner Dashboard):\n` +
        `  Ensure your app in the Shopify Partner Dashboard is owned by the exact same organization\n` +
        `  account that owns the store "${shopDomain}".\n` +
        `================================================================================\n`;
      logger.error(explanation);
      const err = new Error('Shopify Client Credentials failed: shop_not_permitted');
      err.code = 'SHOP_NOT_PERMITTED';
      throw err;
    }

    throw new Error(`Shopify authentication failed (${response.status}): ${errorType} - ${errorDesc}`);
  }

  if (!json.access_token) {
    throw new Error('Shopify authentication response did not contain an access_token.');
  }

  cachedAccessToken = json.access_token;
  // Default to 86400 seconds (24 hours) if expires_in is not provided
  const expiresInSec = json.expires_in || 86400;
  tokenExpiresAt = Date.now() + expiresInSec * 1000;

  logger.success(`Shopify Admin API access token generated successfully. Valid for ${Math.round(expiresInSec / 3600)} hours.`);
  return cachedAccessToken;
}

/**
 * Validates configuration in .env
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateShopifyConfig() {
  const errors = [];
  const shop = process.env.SHOPIFY_SHOP;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!shop) {
    errors.push('SHOPIFY_SHOP is required in .env');
  }

  if (!token && (!clientId || !clientSecret)) {
    errors.push(
      'Either SHOPIFY_CLIENT_ID & SHOPIFY_CLIENT_SECRET (for Client Credentials grant) ' +
      'or SHOPIFY_ADMIN_ACCESS_TOKEN must be specified in .env'
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  getShopDomain,
  getApiVersion,
  getGraphqlEndpoint,
  getAccessToken,
  validateShopifyConfig
};
