import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  if (!showSymbol) return formatted;
  return formatted;
}

export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  return new Intl.DateTimeFormat('en-IN', options).format(d);
}

export function formatDateShort(date: Date | string | number): string {
  return formatDate(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateRelative(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(date);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength).trimEnd();
  return `${truncated}...`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

export function generateId(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export function getInitials(name: string, maxLetters: number = 2): string {
  if (!name.trim()) return '?';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, maxLetters).toUpperCase();
  }

  return parts
    .slice(0, maxLetters)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

export function getImageUrl(
  path: string | null | undefined,
  size?: 'sm' | 'md' | 'lg'
): string {
  if (!path || typeof path !== 'string' || path.trim() === '') return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;

  const sizes = { sm: '150x150', md: '400x400', lg: '800x800' };
  const dimension = size ? sizes[size] : 'original';
  return `${process.env.NEXT_PUBLIC_IMAGE_URL || ''}/uploads/${dimension}/${path}`;
}

export function getSafeImageUrl(
  url?: any,
  fallback: string = ''
): string {
  if (!url) return fallback;

  let raw: any = url;
  if (typeof raw === 'object' && raw !== null) {
    raw = raw.secure_url || raw.url || raw.publicId || raw.public_id || fallback;
  }

  if (typeof raw !== 'string' || !raw.trim()) {
    return fallback;
  }

  let trimmed = raw.trim();

  if (
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed === '[object Object]' ||
    trimmed === 'none'
  ) {
    return fallback;
  }

  if (trimmed.startsWith('blob:')) {
    return fallback;
  }

  if (trimmed.startsWith('http://') && trimmed.includes('cloudinary.com')) {
    trimmed = trimmed.replace('http://', 'https://');
  }

  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('data:')
  ) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'smpyi8aw';
    const cleanPublicId = trimmed.replace(/^\/+/, '');
    trimmed = `https://res.cloudinary.com/${cloudName}/image/upload/${cleanPublicId}`;
  }


  return trimmed;
}

export function getSafeProductImage(
  input: any,
  index: number = 0,
  fallback: string = ''
): string {
  if (!input) return fallback;

  if (typeof input === 'object' && !Array.isArray(input)) {
    const rawArray = Array.isArray(input.images)
      ? input.images
      : Array.isArray(input.galleryImages)
      ? input.galleryImages
      : [];

    const imagesArray = [...rawArray].sort((a: any, b: any) => {
      const orderA = typeof a?.order === 'number' ? a.order : (typeof a?.sortOrder === 'number' ? a.sortOrder : 9999);
      const orderB = typeof b?.order === 'number' ? b.order : (typeof b?.sortOrder === 'number' ? b.sortOrder : 9999);
      return orderA - orderB;
    });

    if (index === 0) {
      const primaryItem = imagesArray.find((img: any) => Boolean(img?.isPrimary));
      if (primaryItem) {
        const candidate = getSafeImageUrl(primaryItem, '');
        if (candidate) return candidate;
      }
    }

    if (imagesArray.length > index && imagesArray[index]) {
      const candidate = getSafeImageUrl(imagesArray[index], '');
      if (candidate) return candidate;
    }

    if (input.thumbnail) {
      const candidate = getSafeImageUrl(input.thumbnail, '');
      if (candidate) return candidate;
    }

    if (imagesArray.length > 0 && imagesArray[0]) {
      const candidate = getSafeImageUrl(imagesArray[0], '');
      if (candidate) return candidate;
    }

    return fallback;
  }

  if (Array.isArray(input)) {
    const sortedArray = [...input].sort((a: any, b: any) => {
      const orderA = typeof a?.order === 'number' ? a.order : (typeof a?.sortOrder === 'number' ? a.sortOrder : 9999);
      const orderB = typeof b?.order === 'number' ? b.order : (typeof b?.sortOrder === 'number' ? b.sortOrder : 9999);
      return orderA - orderB;
    });

    if (index === 0) {
      const primaryItem = sortedArray.find((img: any) => Boolean(img?.isPrimary));
      if (primaryItem) {
        const candidate = getSafeImageUrl(primaryItem, '');
        if (candidate) return candidate;
      }
    }

    if (sortedArray.length > index && sortedArray[index]) {
      const candidate = getSafeImageUrl(sortedArray[index], '');
      if (candidate) return candidate;
    }
    if (sortedArray.length > 0 && sortedArray[0]) {
      const candidate = getSafeImageUrl(sortedArray[0], '');
      if (candidate) return candidate;
    }
    return fallback;
  }

  return getSafeImageUrl(input, fallback);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => start + i);
}

export function extractErrorMessage(err: any, fallback: string = 'Database connection error'): string {
  if (!err) return fallback;
  if (typeof err === 'string') {
    return err.includes('[object Object]') ? fallback : err;
  }

  const data = err?.response?.data;
  if (data) {
    if (typeof data === 'string' && !data.includes('[object Object]')) return data;
    if (typeof data.message === 'string' && data.message.trim() && !data.message.includes('[object Object]')) {
      return data.message;
    }
    if (typeof data.error === 'string' && data.error.trim() && !data.error.includes('[object Object]')) {
      return data.error;
    }
    if (typeof data.message === 'object') {
      const nested = extractErrorMessage(data.message, '');
      if (nested) return nested;
    }
    if (typeof data.error === 'object') {
      const nested = extractErrorMessage(data.error, '');
      if (nested) return nested;
    }
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const nested = extractErrorMessage(data.errors[0], '');
      if (nested) return nested;
    }
  }

  if (typeof err.message === 'string' && err.message.trim() && !err.message.includes('[object Object]')) {
    return err.message;
  }

  if (typeof err.error === 'string' && err.error.trim() && !err.error.includes('[object Object]')) {
    return err.error;
  }

  return fallback;
}

import { getAllProducts } from '@/data/products';

export function extractProducts(res: any): any[] {
  let list: any[] = [];
  if (Array.isArray(res)) list = res;
  else if (Array.isArray(res?.data)) list = res.data;
  else if (Array.isArray(res?.products)) list = res.products;
  else if (res?.data && Array.isArray(res.data.products)) list = res.data.products;
  else if (res?.data && Array.isArray(res.data.data)) list = res.data.data;

  return list || [];
}



export function normalizeProduct(p: any): any {
  if (!p || typeof p !== 'object') return null;

  const rawId = p._id ? (typeof p._id === 'object' ? p._id.toString() : String(p._id)) : (p.id ? String(p.id) : p.slug);
  const id = rawId || p.slug || `prod-${Math.random().toString(36).substring(2, 7)}`;


  let images: string[] = [];
  if (Array.isArray(p.images) && p.images.length > 0) {
    images = p.images
      .map((img: any) => getSafeImageUrl(img, ''))
      .filter((u: string) => Boolean(u && u.trim()));
  } else if (Array.isArray(p.galleryImages) && p.galleryImages.length > 0) {
    images = p.galleryImages
      .map((img: any) => getSafeImageUrl(img, ''))
      .filter((u: string) => Boolean(u && u.trim()));
  } else if (p.images && typeof p.images === 'string') {
    const u = getSafeImageUrl(p.images, '');
    if (u) images.push(u);
  } else if (p.imageUrl && typeof p.imageUrl === 'string') {
    const u = getSafeImageUrl(p.imageUrl, '');
    if (u) images.push(u);
  } else if (p.thumbnail && typeof p.thumbnail === 'string') {
    const u = getSafeImageUrl(p.thumbnail, '');
    if (u) images.push(u);
  }

  if (images.length === 0 && Array.isArray(p.variants) && p.variants.length > 0) {
    p.variants.forEach((v: any) => {
      if (Array.isArray(v.images) && v.images.length > 0) {
        v.images.forEach((img: any) => {
          const u = getSafeImageUrl(img, '');
          if (u && !images.includes(u)) images.push(u);
        });
      }
    });
  }

  const primaryObj = Array.isArray(p.images) ? p.images.find((i: any) => Boolean(i?.isPrimary)) : null;
  const thumbnail = primaryObj
    ? getSafeImageUrl(primaryObj, '')
    : (getSafeImageUrl(p.thumbnail, '') || getSafeImageUrl(p.imageUrl, '') || (images.length > 0 ? images[0] : ''));


  const rawCatSlug = (typeof p.category === 'object' && p.category?.slug)
    ? p.category.slug
    : p.categorySlug || (typeof p.category === 'string' && !/^[0-9a-fA-F]{24}$/.test(p.category) ? p.category : '') || p.subcategory || 'casuals';

  const categorySlug = rawCatSlug.toLowerCase();

  const categoryName = (typeof p.category === 'object' && p.category?.name)
    ? p.category.name
    : (p.categoryName || p.subcategory || rawCatSlug.toUpperCase());

  const variants = Array.isArray(p.variants) ? p.variants : [];
  const minPrice = Number(p.price) || (variants.length > 0 ? Math.min(...variants.map((v: any) => Number(v.price) || Infinity)) : 0) || 0;
  const maxCompare = Number(p.compareAtPrice) || (variants.length > 0 ? Math.max(...variants.map((v: any) => Number(v.compareAtPrice) || 0)) : undefined);
  const calcDiscount = Number(p.discount) || (maxCompare && maxCompare > minPrice ? Math.round(((maxCompare - minPrice) / maxCompare) * 100) : 0);

  const colors = variants.length > 0
    ? Array.from(new Set(variants.map((v: any) => v.color).filter(Boolean))).map((name: any) => ({
        name: name,
        hex: variants.find((v: any) => v.color === name)?.colorHex || '#000000',
      }))
    : (Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [{ name: 'Standard', hex: '#000000' }]);

  const sizes = variants.length > 0
    ? Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean)))
    : (Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L']);

  const totalStock = variants.length > 0 ? variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) : (Number(p.stock) || 0);

  return {
    ...p,
    id,
    _id: id,
    name: p.name || 'YEZ BEE Couture',
    slug: p.slug || id,
    description: p.description || '',
    shortDescription: p.shortDescription || '',
    price: minPrice,
    compareAtPrice: maxCompare && maxCompare > minPrice ? maxCompare : undefined,
    discountPercentage: calcDiscount,
    category: categorySlug,
    categoryName,
    subcategory: p.subcategory || null,
    productType: p.productType || null,
    fabric: p.fabric || 'Pure Cotton',
    fit: p.fit || 'Regular',
    stock: totalStock,
    thumbnail,
    images: images.length > 0 ? images : (thumbnail ? [thumbnail] : []),
    colors,
    sizes,
    featured: Boolean(p.featured || p.isFeatured),
    bestseller: Boolean(p.bestSeller || p.isBestSeller || p.bestseller),
    newArrival: Boolean(p.newArrival || p.isNewProduct || p.isNew),
    isNew: Boolean(p.newArrival || p.isNewProduct || p.isNew),
    isNewProduct: Boolean(p.newArrival || p.isNewProduct || p.isNew),
    createdAt: p.createdAt || new Date().toISOString(),
  };
}

export function normalizeCategorySlug(val?: string): string {
  if (!val) return '';
  return val.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

export function matchesCategory(p: any, categorySlug: string, subcategoryType?: string): boolean {
  if (!categorySlug || categorySlug === 'all') return true;

  const targetCat = normalizeCategorySlug(categorySlug);
  const prodCat = normalizeCategorySlug(p.category);
  const prodCatSlug = normalizeCategorySlug(p.categorySlug);
  const prodCatName = normalizeCategorySlug(p.categoryName);
  const prodSub = normalizeCategorySlug(p.subcategory);

  const catMatches =
    prodCat === targetCat ||
    prodCatSlug === targetCat ||
    prodCatName === targetCat ||
    prodSub === targetCat ||
    (prodCat && prodCat.includes(targetCat) && !/^[0-9a-fA-F]{24}$/.test(p.category)) ||
    (prodCatSlug && prodCatSlug.includes(targetCat)) ||
    (prodCatName && prodCatName.includes(targetCat)) ||
    (prodSub && prodSub.includes(targetCat));

  if (!catMatches) return false;

  if (subcategoryType && subcategoryType !== 'all') {
    const targetType = subcategoryType.toUpperCase();
    const pType = (p.productType || p.subcategory || '').toString().toUpperCase();
    if (pType.includes(targetType) || targetType.includes(pType)) {
      return true;
    }
    return false;
  }

  return true;
}
