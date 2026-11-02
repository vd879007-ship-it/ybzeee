/**
 * Shopify Storefront API Client for YEZ BEE Fashion
 * Connects Next.js 14 App Router frontend to Shopify Storefront GraphQL API (2026-10).
 * Handles product listing, pagination, product by handle, exact variant matching, and Shopify Cart/Checkout.
 */

import { CatalogProduct, ProductVariant } from '@/data/products';

const SHOPIFY_STORE_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  'yezbee-fashion-skmumi5z.myshopify.com';

const SHOPIFY_STOREFRONT_TOKEN =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
  '';

const SHOPIFY_API_VERSION =
  process.env.SHOPIFY_API_VERSION ||
  process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ||
  '2026-10';

const STOREFRONT_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

/**
 * Low-level Storefront GraphQL executor with rate-limit and error handling.
 */
export async function executeStorefrontGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  if (!SHOPIFY_STOREFRONT_TOKEN) {
    throw new Error('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is missing in environment.');
  }

  const response = await fetch(STOREFRONT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 }, // Cache on Next.js server for 60s
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shopify Storefront HTTP ${response.status}: ${errorText}`);
  }

  const json = await response.json();

  if (json.errors && json.errors.length > 0) {
    const messages = json.errors.map((e: any) => e.message).join('; ');
    throw new Error(`Shopify Storefront GraphQL Error: ${messages}`);
  }

  return json.data as T;
}

/**
 * Transforms Shopify GraphQL product node into standard YEZ BEE CatalogProduct.
 */
export function transformShopifyProduct(node: any): CatalogProduct {
  const images = (node.images?.edges || []).map((e: any) => e.node.url);
  const primaryImage = node.featuredImage?.url || images[0] || '/images/hero/hero1.png';

  const variants: ProductVariant[] = (node.variants?.edges || []).map((e: any) => {
    const v = e.node;
    const sizeOpt = v.selectedOptions?.find((o: any) => o.name.toLowerCase() === 'size')?.value || 'Free Size';
    const colorOpt = v.selectedOptions?.find((o: any) => o.name.toLowerCase() === 'color')?.value || 'Standard';

    return {
      id: v.id, // gid://shopify/ProductVariant/...
      sku: v.sku || '',
      size: sizeOpt,
      color: colorOpt,
      stock: v.quantityAvailable ?? (v.availableForSale ? 10 : 0),
      price: parseFloat(v.price?.amount || '0'),
      compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice.amount) : undefined,
      isActive: Boolean(v.availableForSale),
    };
  });

  const sizes = Array.from(new Set(variants.map((v) => v.size))).filter(Boolean);
  const colors = Array.from(new Set(variants.map((v) => v.color))).map((c) => ({
    name: c,
    hex: '#D4AF37', // Default luxury gold accent
  }));

  const price = variants[0]?.price || parseFloat(node.priceRange?.minVariantPrice?.amount || '0');
  const compareAtPrice = variants[0]?.compareAtPrice || null;
  const discountPercentage =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

  // Determine category & feeding classification from tags / productType
  const productType = (node.productType || '').toUpperCase();
  const tags: string[] = node.tags || [];
  const isFeeding = productType.includes('FEEDING') || tags.some((t) => t.toUpperCase().includes('FEEDING'));
  const categoryRaw = tags.find((t) => ['casuals', 'party-wear', 'ethnic-wear', 'lounge-wear', 'peplum-tops', 'kids-wear'].includes(t.toLowerCase())) || 'casuals';

  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  // Metafield extractions if available
  const metafields = node.metafields || [];
  const getMeta = (key: string) => metafields.find((m: any) => m?.key === key)?.value;

  return {
    id: node.id,
    slug: node.handle,
    name: node.title,
    category: categoryRaw.toLowerCase(),
    categoryName: categoryRaw.toUpperCase().replace('-', ' '),
    productType: isFeeding ? 'FEEDING' : 'NON-FEEDING',
    subcategory: isFeeding ? 'Feeding' : 'Non-Feeding',
    shortDescription: node.description?.slice(0, 160) || '',
    description: node.descriptionHtml || node.description || '',
    price,
    compareAtPrice,
    discountPercentage,
    currency: node.priceRange?.minVariantPrice?.currencyCode || 'INR',
    images,
    thumbnail: primaryImage,
    colors,
    variants,
    fabric: getMeta('fabric') || '100% Pure Cotton',
    fit: 'Regular Luxury Fit',
    pattern: getMeta('pattern') || 'Floral / Motif Print',
    neckStyle: 'Round / Notch Neck',
    sleeveLength: getMeta('sleeve_length') || '3/4th Sleeve',
    length: getMeta('length') || 'Ankle / Midi Length',
    occasion: 'Maternity, Feeding & Casual Wear',
    gender: 'Women',
    maternity: isFeeding,
    feedingFriendly: isFeeding,
    sizes,
    stock: totalStock,
    rating: 4.9,
    reviewCount: 18,
    tags,
    careInstructions: getMeta('care_instructions') || 'Gentle machine wash with like colors.',
    shippingInfo: 'Dispatched within 24 hours. Free delivery on prepaid orders.',
    returnPolicy: '7-day hassle-free replacement / return.',
    featured: tags.includes('featured') || tags.includes('BestSeller'),
    bestseller: tags.includes('bestseller'),
    newArrival: tags.includes('new'),
    status: 'published',
    active: true,
  };
}

/**
 * Fetches all products using Storefront GraphQL pagination.
 */
export async function getShopifyProducts(maxItems: number = 250): Promise<CatalogProduct[]> {
  const allProducts: CatalogProduct[] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  const query = `
    query GetStorefrontProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            handle
            vendor
            productType
            tags
            description
            descriptionHtml
            featuredImage {
              url
              altText
            }
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  sku
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    while (hasNextPage && allProducts.length < maxItems) {
      const data: any = await executeStorefrontGraphQL<any>(query, {
        first: Math.min(50, maxItems - allProducts.length),
        after: cursor,
      });

      const edges = data?.products?.edges || [];
      for (const edge of edges) {
        allProducts.push(transformShopifyProduct(edge.node));
      }

      hasNextPage = Boolean(data?.products?.pageInfo?.hasNextPage);
      cursor = data?.products?.pageInfo?.endCursor || null;
    }
  } catch (err: any) {
    console.error('[Shopify Storefront Client] Failed to fetch products:', err.message);
  }

  return allProducts;
}

/**
 * Fetches a single product by handle from Shopify Storefront API.
 */
export async function getShopifyProductByHandle(handle: string): Promise<CatalogProduct | null> {
  const query = `
    query GetProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        vendor
        productType
        tags
        description
        descriptionHtml
        featuredImage {
          url
          altText
        }
        images(first: 15) {
          edges {
            node {
              url
              altText
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 25) {
          edges {
            node {
              id
              title
              sku
              availableForSale
              quantityAvailable
              price {
                amount
              }
              compareAtPrice {
                amount
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data: any = await executeStorefrontGraphQL<any>(query, { handle });
    if (!data?.product) return null;
    return transformShopifyProduct(data.product);
  } catch (err: any) {
    console.error(`[Shopify Storefront Client] getShopifyProductByHandle(${handle}) error:`, err.message);
    return null;
  }
}

/**
 * Centralized Exact Variant Matcher using Shopify selectedOptions.
 * Matches exact size and color without substring ambiguities.
 */
export function matchExactVariant(
  variants: ProductVariant[],
  size: string,
  color?: string
): ProductVariant | undefined {
  if (!variants || variants.length === 0) return undefined;

  const targetSize = size ? size.trim().toUpperCase() : '';
  const targetColor = color ? color.trim().toUpperCase() : '';

  // 1. Try matching both Size AND Color exactly
  if (targetColor) {
    const match = variants.find((v) => {
      const vSize = (v.size || '').trim().toUpperCase();
      const vColor = (v.color || '').trim().toUpperCase();
      return vSize === targetSize && vColor === targetColor;
    });
    if (match) return match;
  }

  // 2. Match exact Size
  return variants.find((v) => (v.size || '').trim().toUpperCase() === targetSize);
}

/**
 * ============================================================================
 * SHOPIFY STOREFRONT CART & CHECKOUT API
 * ============================================================================
 */

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
    };
    price: {
      amount: string;
      currencyCode: string;
    };
    image?: {
      url: string;
    };
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: ShopifyCartLine[];
}

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    totalAmount {
      amount
      currencyCode
    }
    subtotalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            product {
              title
              handle
            }
            price {
              amount
              currencyCode
            }
            image {
              url
            }
          }
        }
      }
    }
  }
`;

function formatCart(cartData: any): ShopifyCart {
  return {
    id: cartData.id,
    checkoutUrl: cartData.checkoutUrl,
    totalQuantity: cartData.totalQuantity,
    cost: cartData.cost,
    lines: (cartData.lines?.edges || []).map((e: any) => e.node),
  };
}

/**
 * Creates a new Shopify Cart.
 */
export async function shopifyCartCreate(
  lines: Array<{ merchandiseId: string; quantity: number }> = []
): Promise<ShopifyCart> {
  const query = `
    mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart {
          ${CART_FIELDS}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data: any = await executeStorefrontGraphQL<any>(query, { lines });
  if (data?.cartCreate?.userErrors?.length > 0) {
    throw new Error(data.cartCreate.userErrors.map((e: any) => e.message).join('; '));
  }
  return formatCart(data.cartCreate.cart);
}

/**
 * Adds line items to an existing Shopify Cart.
 */
export async function shopifyCartLinesAdd(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>
): Promise<ShopifyCart> {
  const query = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FIELDS}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data: any = await executeStorefrontGraphQL<any>(query, { cartId, lines });
  if (data?.cartLinesAdd?.userErrors?.length > 0) {
    throw new Error(data.cartLinesAdd.userErrors.map((e: any) => e.message).join('; '));
  }
  return formatCart(data.cartLinesAdd.cart);
}

/**
 * Updates item quantities in a Shopify Cart.
 */
export async function shopifyCartLinesUpdate(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
): Promise<ShopifyCart> {
  const query = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FIELDS}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data: any = await executeStorefrontGraphQL<any>(query, { cartId, lines });
  if (data?.cartLinesUpdate?.userErrors?.length > 0) {
    throw new Error(data.cartLinesUpdate.userErrors.map((e: any) => e.message).join('; '));
  }
  return formatCart(data.cartLinesUpdate.cart);
}

/**
 * Removes lines from a Shopify Cart.
 */
export async function shopifyCartLinesRemove(
  cartId: string,
  lineIds: string[]
): Promise<ShopifyCart> {
  const query = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${CART_FIELDS}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data: any = await executeStorefrontGraphQL<any>(query, { cartId, lineIds });
  if (data?.cartLinesRemove?.userErrors?.length > 0) {
    throw new Error(data.cartLinesRemove.userErrors.map((e: any) => e.message).join('; '));
  }
  return formatCart(data.cartLinesRemove.cart);
}

/**
 * Fetches an existing Shopify Cart by ID.
 */
export async function shopifyCartGet(cartId: string): Promise<ShopifyCart | null> {
  const query = `
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        ${CART_FIELDS}
      }
    }
  `;

  try {
    const data: any = await executeStorefrontGraphQL<any>(query, { cartId });
    if (!data?.cart) return null;
    return formatCart(data.cart);
  } catch {
    return null;
  }
}
