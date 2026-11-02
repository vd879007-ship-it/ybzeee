import { getSafeImageUrl } from '@/lib/utils';
import { getCategoryBySlug } from './categories';

export interface ProductVariant {
  id?: string;
  color: string;
  size: string;
  sku: string;
  stock: number;
  price?: number;
  compareAtPrice?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
}

export interface ProductSeo {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  productType?: 'FEEDING' | 'NON-FEEDING' | null;
  subcategory: string;
  shortDescription: string;
  description: string;
  highlights?: string[];
  price: number;
  compareAtPrice: number | null;
  costPrice?: number;
  discountPercentage: number;
  currency: string;
  images: string[];
  thumbnail: string;
  colors: { name: string; hex: string }[];
  variants: ProductVariant[];
  fabric: string;
  fit: string;
  pattern?: string;
  neckStyle?: string;
  sleeveLength?: string;
  length?: string;
  occasion: string;
  gender: string;
  ageGroup?: string;
  maternity: boolean;
  feedingFriendly: boolean;
  sizes: string[];
  stock: number;
  lowStockThreshold?: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  careInstructions: string;
  shippingInfo: string;
  returnPolicy: string;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  status: 'published' | 'draft' | 'archived';
  active: boolean;
  seo?: ProductSeo;
  createdAt?: string;
  updatedAt?: string;
}

import catalogJson from './catalog.json';

export const INITIAL_PRODUCTS: CatalogProduct[] = (catalogJson as any[]) || [];

let cachedProducts: CatalogProduct[] = [...INITIAL_PRODUCTS];
let isFetching = false;

export function getCategoryNameBySlug(slug: string): string {
  const map: Record<string, string> = {
    'casuals': 'CASUALS',
    'party-wear': 'PARTY WEAR',
    'ethnic-wear': 'ETHNIC WEAR',
    'lounge-wear': 'LOUNGE WEAR',
    'peplum-tops': 'PEPLUM TOPS',
    'kids-wear': 'KIDS WEAR',
  };
  return map[slug] || 'CASUALS';
}

function normalizeCatalogProduct(p: any): CatalogProduct {
  const catConfig = getCategoryBySlug(p.category) || (p.categoryName ? getCategoryBySlug(p.categoryName) : undefined);
  const categorySlug = catConfig?.slug || (typeof p.category === 'string' && !p.category.match(/^[0-9a-fA-F]{24}$/) ? p.category.toLowerCase().trim() : 'casuals');
  const categoryName = catConfig?.name || p.categoryName || getCategoryNameBySlug(categorySlug);

  const rawImages = Array.isArray(p.images) ? p.images : [];
  const cleanImages = rawImages.map((img: any) => {
    if (typeof img === 'string') return img;
    return img?.url || img?.secure_url || '';
  }).filter(Boolean);

  const primaryImage = rawImages.find((img: any) => img?.isPrimary)?.url || cleanImages[0] || p.thumbnail || '';

  const colors = Array.isArray(p.colors) && p.colors.length > 0 
    ? p.colors 
    : (p.variants && p.variants.length > 0 
        ? Array.from(new Set(p.variants.map((v: any) => v.color))).map(name => ({
            name: String(name),
            hex: p.variants.find((v: any) => v.color === name)?.colorHex || '#000000'
          }))
        : [{ name: 'Standard', hex: '#000000' }]
      );

  const sizes = Array.isArray(p.sizes) && p.sizes.length > 0
    ? p.sizes
    : (p.variants && p.variants.length > 0
        ? Array.from(new Set(p.variants.map((v: any) => v.size)))
        : ['S', 'M', 'L', 'XL']
      );

  const totalStock = typeof p.stock === 'number'
    ? p.stock
    : (p.variants && p.variants.length > 0
        ? p.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
        : 10
      );

  return {
    id: p._id || p.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    slug: p.slug || (p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `prod-${Date.now()}`),
    name: p.name || 'Untitled Product',
    category: categorySlug,
    categoryName,
    productType: p.productType || null,
    subcategory: p.subcategory || (p.productType === 'FEEDING' ? 'Feeding' : p.productType === 'NON-FEEDING' ? 'Non-Feeding' : 'General'),
    shortDescription: p.shortDescription || p.description || '',
    description: p.description || '',
    highlights: p.highlights || [],
    price: Number(p.price) || 999,
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    discountPercentage: p.discount || p.discountPercentage || 0,
    currency: p.currency || 'INR',
    images: cleanImages,
    thumbnail: primaryImage || p.thumbnail || '',
    colors,
    variants: p.variants || [],
    fabric: p.fabric || '100% Pure Cotton',
    fit: p.fit || 'Regular Fit',
    pattern: p.pattern || 'Printed',
    neckStyle: p.neckStyle || 'Round Neck',
    sleeveLength: p.sleeveLength || '3/4th Sleeve',
    length: p.length || 'Regular',
    occasion: p.occasion || 'Everyday',
    gender: p.gender || 'Women',
    ageGroup: p.ageGroup || '',
    maternity: p.productType === 'FEEDING' || !!p.maternity,
    feedingFriendly: p.productType === 'FEEDING' || !!p.feedingFriendly,
    sizes,
    stock: totalStock,
    lowStockThreshold: p.lowStockThreshold || 5,
    rating: p.rating || p.ratings?.average || 5.0,
    reviewCount: p.reviewCount || p.ratings?.count || 0,
    tags: p.tags || [],
    careInstructions: Array.isArray(p.careInstructions) ? p.careInstructions.join('. ') : (p.careInstructions || 'Machine wash cold.'),
    shippingInfo: p.shippingInfo || 'Dispatched within 24 hours.',
    returnPolicy: p.returnPolicy || '7-day easy returns.',
    featured: !!p.featured,
    bestseller: !!p.bestseller || !!p.bestSeller,
    newArrival: !!p.newArrival,
    status: (p.status || 'PUBLISHED').toLowerCase() as any,
    active: (p.status || 'PUBLISHED').toUpperCase() === 'PUBLISHED',
    seo: p.seo || {
      title: `${p.name || 'Product'} | YEZ BEE Fashion`,
      description: p.shortDescription || 'Shop YEZ BEE Fashion.',
    },
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function fetchProductsFromApi(): Promise<CatalogProduct[]> {
  if (typeof window === 'undefined') return [];
  try {
    // 1. Primary: Fetch live products from Shopify Storefront API
    const { getShopifyProducts } = await import('@/lib/shopify');
    const shopifyProducts = await getShopifyProducts(250);

    if (shopifyProducts && shopifyProducts.length > 0) {
      cachedProducts = shopifyProducts;
      return cachedProducts;
    }
  } catch (shopifyErr: any) {
    console.warn('[Shopify Storefront] Fetch fallback:', shopifyErr.message);
  }

  // 2. Fallback: Secondary API client or cache
  try {
    const apiModule = await import('@/lib/api');
    const response = await apiModule.api.getProducts({ limit: 200 });
    if (response && response.data && Array.isArray(response.data)) {
      cachedProducts = response.data.map(normalizeCatalogProduct);
    }
  } catch (err) {
    console.error('Failed to fetch fallback products from API:', err);
  }
  return cachedProducts;
}

export function getAllProducts(): CatalogProduct[] {
  if (typeof window !== 'undefined' && cachedProducts.length === 0 && !isFetching) {
    isFetching = true;
    fetchProductsFromApi().finally(() => {
      isFetching = false;
      window.dispatchEvent(new Event('yezbee_products_updated'));
    });
  }
  return cachedProducts;
}

export function getProductBySlug(slug: string): CatalogProduct | undefined {
  const products = getAllProducts();
  return products.find((p) => (p.slug === slug || p.id === slug) && p.status !== 'archived');
}

export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    const { getShopifyProductByHandle } = await import('@/lib/shopify');
    const shopifyProduct = await getShopifyProductByHandle(slug);
    if (shopifyProduct) {
      return shopifyProduct;
    }
  } catch (err: any) {
    console.warn(`[Shopify Storefront] fetchProductBySlug(${slug}) error:`, err.message);
  }
  return getProductBySlug(slug) || null;
}

export function getProductById(id: string): CatalogProduct | undefined {
  const products = getAllProducts();
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categorySlug: string, productType?: 'FEEDING' | 'NON-FEEDING' | string | null): CatalogProduct[] {
  const normalizedCat = categorySlug.toLowerCase().trim();
  const products = getAllProducts().filter((p) => p.status === 'published');
  
  if (normalizedCat === 'all') return products;

  const legacyMap: Record<string, { cat: string; type?: 'FEEDING' | 'NON-FEEDING' }> = {
    'maternity-kurtis': { cat: 'casuals', type: 'FEEDING' },
    'maternity-feeding-loungewears': { cat: 'lounge-wear', type: 'FEEDING' },
    'maternity-intimatewears': { cat: 'lounge-wear', type: 'FEEDING' },
    'non-maternity-kurtis-dresses': { cat: 'casuals', type: 'NON-FEEDING' },
    'kids-clothing': { cat: 'kids-wear' },
    'loungewear': { cat: 'lounge-wear', type: 'NON-FEEDING' },
  };

  let targetCat = normalizedCat;
  let targetType = productType;

  if (legacyMap[normalizedCat]) {
    targetCat = legacyMap[normalizedCat].cat;
    if (!targetType) {
      targetType = legacyMap[normalizedCat].type;
    }
  }

  const categoryConfig = getCategoryBySlug(targetCat);
  const targetCategorySlug = categoryConfig?.slug || targetCat;
  const targetCategoryName = (categoryConfig?.name || targetCat).toLowerCase();

  return products.filter((p) => {
    const rawCat = typeof p.category === 'string' ? p.category : (p.category as any)?.slug || (p.category as any)?.name || '';
    const rawCatName = (p.categoryName || '').toLowerCase().trim();

    const catSlug = rawCat.toLowerCase().trim().replace(/\s+/g, '-');
    const catNameSlug = rawCatName.replace(/\s+/g, '-');

    const matchesCat =
      catSlug === targetCategorySlug ||
      catNameSlug === targetCategorySlug ||
      rawCatName === targetCategoryName ||
      catSlug.includes(targetCategorySlug) ||
      targetCategorySlug.includes(catSlug) ||
      (categoryConfig && (p.category === categoryConfig.id || p.category === categoryConfig.slug));

    if (!matchesCat) return false;

    if (targetType && targetType !== 'all') {
      const normType = targetType.toUpperCase();
      return (p.productType || '').toUpperCase() === normType;
    }

    return true;
  });
}

export function saveOrUpdateProduct(productData: Partial<CatalogProduct>): CatalogProduct {
  const normalized = normalizeCatalogProduct(productData);
  const existingIndex = cachedProducts.findIndex((p) => p.id === normalized.id);
  if (existingIndex >= 0) {
    cachedProducts[existingIndex] = normalized;
  } else {
    cachedProducts.unshift(normalized);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('yezbee_products_updated'));
  }
  return normalized;
}

export function updateProductStatus(id: string, newStatus: 'published' | 'draft' | 'archived'): boolean {
  const index = cachedProducts.findIndex((p) => p.id === id);
  if (index < 0) return false;

  cachedProducts[index].status = newStatus;
  cachedProducts[index].active = newStatus === 'published';
  cachedProducts[index].updatedAt = new Date().toISOString();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('yezbee_products_updated'));
  }
  return true;
}

export function duplicateProduct(id: string): CatalogProduct | null {
  const original = getProductById(id);
  if (!original) return null;

  const newId = `PRD-${Date.now()}`;
  const copy: CatalogProduct = {
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
    status: 'draft',
    active: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: original.variants.map((v) => ({
      ...v,
      sku: `${v.sku}-COPY`,
    })),
  };

  return saveOrUpdateProduct(copy);
}

export function deleteOrArchiveProduct(id: string): boolean {
  return updateProductStatus(id, 'archived');
}

export function permanentDeleteProduct(id: string): boolean {
  cachedProducts = cachedProducts.filter((p) => p.id !== id && p.slug !== id);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('yezbee_products_updated'));
  }
  return true;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export function getDeletedProductIds(): string[] {
  return [];
}


