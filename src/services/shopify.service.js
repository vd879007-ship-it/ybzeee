/**
 * Shopify Admin GraphQL API Service
 * Production client handling GraphQL execution, rate limiting, product lifecycle, and location management.
 */

const { getAccessToken, getGraphqlEndpoint, getShopDomain } = require('../config/shopify');
const { withRetry, sleep } = require('../utils/retry');
const logger = require('../utils/logger');

class ShopifyService {
  /**
   * Executes a Shopify Admin GraphQL query or mutation with rate limit handling and retries.
   * 
   * @param {string} query GraphQL document string
   * @param {Object} variables Query variables
   * @returns {Promise<Object>} GraphQL response data
   */
  async executeGraphQL(query, variables = {}) {
    return withRetry(async () => {
      const endpoint = getGraphqlEndpoint();
      const accessToken = await getAccessToken();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query, variables })
      });

      // Handle HTTP status codes
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 2;
        const err = new Error('Shopify API 429 Rate Limit Exceeded');
        err.status = 429;
        err.retryAfter = retryAfter;
        throw err;
      }

      if (!response.ok) {
        const text = await response.text();
        const err = new Error(`Shopify HTTP ${response.status}: ${text}`);
        err.status = response.status;
        throw err;
      }

      const json = await response.json();

      // Check top-level GraphQL errors
      if (json.errors && json.errors.length > 0) {
        const throttled = json.errors.some(e => e.extensions?.code === 'THROTTLED');
        if (throttled) {
          const err = new Error('Shopify GraphQL THROTTLED');
          err.status = 429;
          throw err;
        }
        const errorMessages = json.errors.map(e => e.message).join('; ');
        throw new Error(`Shopify GraphQL Error: ${errorMessages}`);
      }

      // Proactive rate-limit throttling using leaky bucket cost extensions
      if (json.extensions?.cost?.throttleStatus) {
        const { currentlyAvailable, restoreRate } = json.extensions.cost.throttleStatus;
        if (currentlyAvailable < 150 && restoreRate > 0) {
          const needed = 150 - currentlyAvailable;
          const waitMs = Math.ceil((needed / restoreRate) * 1000);
          logger.debug(`API leaky bucket low (${currentlyAvailable} available). Pausing ${waitMs}ms...`);
          await sleep(waitMs);
        }
      }

      return json.data;
    }, {
      operationName: 'ShopifyGraphQL',
      maxRetries: 5,
      baseDelay: 1200
    });
  }

  /**
   * Tests connection to Shopify and retrieves shop details
   * @returns {Promise<Object>}
   */
  async testConnection() {
    const query = `
      query TestShopifyConnection {
        shop {
          id
          name
          email
          myshopifyDomain
          currencyCode
          plan {
            displayName
          }
        }
      }
    `;

    const data = await this.executeGraphQL(query);
    return data?.shop;
  }

  /**
   * Fetches active inventory locations in Shopify
   * @returns {Promise<Array<Object>>}
   */
  async getLocations() {
    const query = `
      query GetActiveLocations {
        locations(first: 20, includeInactive: false) {
          nodes {
            id
            name
            isActive
            shipsInventory
            address {
              city
              province
              country
            }
          }
        }
      }
    `;

    const data = await this.executeGraphQL(query);
    return data?.locations?.nodes || [];
  }

  /**
   * Find existing product by handle
   * @param {string} handle 
   * @returns {Promise<Object|null>}
   */
  async findProductByHandle(handle) {
    const query = `
      query FindProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          handle
          status
          variants(first: 50) {
            nodes {
              id
              sku
              title
              inventoryItem {
                id
              }
            }
          }
        }
      }
    `;

    const data = await this.executeGraphQL(query, { handle });
    return data?.productByHandle || null;
  }

  /**
   * Unified Product Creation or Update using modern GraphQL productSet mutation
   * Creates/updates product, options, variants with identical SKUs, media, and metafields.
   * 
   * @param {Object} mapped Mapped product from product.mapper.js
   * @param {string|null} existingShopifyProductId If updating an existing Shopify product
   * @returns {Promise<{ product: Object, userErrors: Array }>}
   */
  async setProduct(mapped, existingShopifyProductId = null) {
    const mutation = `
      mutation ProductSet($synchronous: Boolean!, $input: ProductSetInput!) {
        productSet(synchronous: $synchronous, input: $input) {
          product {
            id
            title
            handle
            status
            totalInventory
            variants(first: 50) {
              nodes {
                id
                title
                sku
                price
                compareAtPrice
                selectedOptions {
                  name
                  value
                }
                inventoryItem {
                  id
                  tracked
                }
              }
            }
            media(first: 20) {
              nodes {
                id
                alt
                status
              }
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    // Construct ProductSetInput
    const input = {
      title: mapped.title,
      descriptionHtml: mapped.descriptionHtml,
      vendor: mapped.vendor,
      productType: mapped.productType,
      status: mapped.status,
      tags: mapped.tags,
      seo: mapped.seo,
      productOptions: mapped.productOptions,
      metafields: mapped.metafields,
      variants: mapped.variants.map((v) => ({
        optionValues: v.optionValues,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        sku: v.sku, // PRESERVES EXACT IDENTICAL SKU FOR ALL SIZES
        inventoryItem: {
          tracked: true
        }
      }))
    };

    if (existingShopifyProductId) {
      input.id = existingShopifyProductId;
    }

    // Attach Cloudinary media
    if (mapped.images && mapped.images.length > 0) {
      input.files = mapped.images.map((img) => ({
        originalSource: img.originalSource,
        alt: img.altText,
        contentType: 'IMAGE'
      }));
    }

    try {
      const data = await this.executeGraphQL(mutation, {
        synchronous: true,
        input
      });

      return data?.productSet || { product: null, userErrors: [] };
    } catch (err) {
      // If productSet mutation is not supported, fall back to productCreate + variants bulk
      logger.warn(`productSet mutation attempt encountered: ${err.message}. Trying productCreate fallback...`);
      return await this.productCreateFallback(mapped, existingShopifyProductId);
    }
  }

  /**
   * Fallback method using productCreate + productVariantsBulkCreate
   */
  async productCreateFallback(mapped, existingShopifyProductId = null) {
    if (existingShopifyProductId) {
      throw new Error(`Update fallback for existing product ${existingShopifyProductId} requires productSet mutation.`);
    }

    const createMutation = `
      mutation ProductCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
        productCreate(input: $input, media: $media) {
          product {
            id
            title
            handle
            variants(first: 10) {
              nodes {
                id
                inventoryItem {
                  id
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const mediaInput = (mapped.images || []).map((img) => ({
      originalSource: img.originalSource,
      alt: img.altText,
      mediaContentType: 'IMAGE'
    }));

    const productInput = {
      title: mapped.title,
      descriptionHtml: mapped.descriptionHtml,
      vendor: mapped.vendor,
      productType: mapped.productType,
      status: mapped.status,
      tags: mapped.tags,
      seo: mapped.seo,
      metafields: mapped.metafields
    };

    const res = await this.executeGraphQL(createMutation, {
      input: productInput,
      media: mediaInput
    });

    if (res?.productCreate?.userErrors?.length > 0) {
      return { product: null, userErrors: res.productCreate.userErrors };
    }

    const createdProduct = res?.productCreate?.product;
    if (!createdProduct) {
      throw new Error('productCreate returned no product.');
    }

    // Now create all variants with bulk mutation
    const bulkVariantsMutation = `
      mutation ProductVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(productId: $productId, variants: $variants) {
          productVariants {
            id
            title
            sku
            price
            inventoryItem {
              id
              tracked
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variantsInput = mapped.variants.map((v) => ({
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      sku: v.sku, // PRESERVES EXACT IDENTICAL SKU FOR ALL SIZES
      optionValues: v.optionValues,
      inventoryItem: {
        tracked: true
      }
    }));

    const varRes = await this.executeGraphQL(bulkVariantsMutation, {
      productId: createdProduct.id,
      variants: variantsInput
    });

    const fullProduct = await this.fetchProductDetails(createdProduct.id);
    return {
      product: fullProduct,
      userErrors: varRes?.productVariantsBulkCreate?.userErrors || []
    };
  }

  /**
   * Fetches full product details by Shopify product ID for post-migration verification
   * @param {string} productId 
   * @returns {Promise<Object>}
   */
  async fetchProductDetails(productId) {
    const query = `
      query GetProductDetails($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          vendor
          productType
          status
          tags
          variants(first: 50) {
            nodes {
              id
              title
              sku
              price
              compareAtPrice
              selectedOptions {
                name
                value
              }
              inventoryItem {
                id
                tracked
                inventoryLevels(first: 10) {
                  nodes {
                    location {
                      id
                      name
                    }
                    quantities(names: ["available", "on_hand"]) {
                      name
                      quantity
                    }
                  }
                }
              }
            }
          }
          media(first: 30) {
            nodes {
              id
              alt
              status
              ... on MediaImage {
                image {
                  url
                }
              }
            }
          }
          metafields(first: 25) {
            nodes {
              namespace
              key
              value
            }
          }
        }
      }
    `;

    const data = await this.executeGraphQL(query, { id: productId });
    return data?.product || null;
  }

  /**
   * Fetches all products currently in Shopify with variants, inventory levels, media, and metafields.
   * Handles pagination automatically using GraphQL cursors.
   * 
   * @param {number} pageSize 
   * @returns {Promise<Array<Object>>}
   */
  async getAllProducts(pageSize = 15) {
    const allProducts = [];
    let hasNextPage = true;
    let cursor = null;

    const query = `
      query GetAllProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            title
            handle
            vendor
            productType
            status
            tags
            variants(first: 20) {
              nodes {
                id
                title
                sku
                price
                compareAtPrice
                selectedOptions {
                  name
                  value
                }
                inventoryItem {
                  id
                  tracked
                  inventoryLevels(first: 5) {
                    nodes {
                      location {
                        id
                        name
                      }
                      quantities(names: ["available", "on_hand"]) {
                        name
                        quantity
                      }
                    }
                  }
                }
              }
            }
            media(first: 15) {
              nodes {
                id
                alt
                status
                ... on MediaImage {
                  image {
                    url
                  }
                }
              }
            }
            metafields(first: 20) {
              nodes {
                namespace
                key
                value
              }
            }
          }
        }
      }
    `;

    while (hasNextPage) {
      const data = await this.executeGraphQL(query, { first: pageSize, after: cursor });
      const productsData = data?.products;
      if (!productsData) break;

      const nodes = productsData.nodes || [];
      allProducts.push(...nodes);

      hasNextPage = Boolean(productsData.pageInfo?.hasNextPage);
      cursor = productsData.pageInfo?.endCursor || null;
    }

    return allProducts;
  }
}

module.exports = new ShopifyService();
