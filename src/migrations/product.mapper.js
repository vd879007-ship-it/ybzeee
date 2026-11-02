/**
 * Product Mapper
 * Maps Firebase Firestore product schema to Shopify GraphQL ProductSet / ProductCreate schema.
 * 
 * Strict Compliance:
 * - Identical SKU across all sizes within the same product (never append size, never generate synthetic SKUs)
 * - Deterministic handle collision deduplication (preserves unique handles, resolves duplicates cleanly)
 * - Cloudinary image preservation & ordering
 * - Rich metafields preservation for fashion attributes
 * - Clean HTML description formatting
 * - SEO metadata mapping
 */

const cloudinaryService = require('../services/cloudinary.service');
const {
  matchShopifyVariantToSource,
  matchSourceVariantToShopify,
  extractShopifyVariantOptions,
  normalize
} = require('../utils/variant-matcher');

/**
 * Creates a URL-safe lowercase slug from a string
 * @param {string} text 
 * @returns {string} E.g. "sbf-057"
 */
function slugify(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolves a deterministic, unique Shopify handle for a product.
 * Preserves the original slug if unique. If duplicated across products,
 * generates a deterministic unique handle derived from product title or numeric suffix.
 * 
 * @param {Object} rawDoc Raw Firestore product document
 * @param {Map<string, string>|Set<string>|null} allocatedHandles Registry of already allocated handles
 * @returns {{ handle: string, isDeduplicated: boolean, originalSlug: string }}
 */
function resolveUniqueHandle(rawDoc, allocatedHandles = null) {
  const originalSlug = (rawDoc.slug || slugify(rawDoc.name) || 'product').trim().toLowerCase();

  if (!allocatedHandles) {
    return { handle: originalSlug, isDeduplicated: false, originalSlug };
  }

  // Check if originalSlug is already claimed by another document
  const isTaken = allocatedHandles instanceof Map
    ? (allocatedHandles.has(originalSlug) && allocatedHandles.get(originalSlug) !== rawDoc.id)
    : allocatedHandles.has(originalSlug);

  if (!isTaken) {
    if (allocatedHandles instanceof Map) allocatedHandles.set(originalSlug, rawDoc.id);
    else allocatedHandles.add(originalSlug);
    return { handle: originalSlug, isDeduplicated: false, originalSlug };
  }

  // Handle collision: First try clean slug derived from product title (e.g. 'SBF 057' -> 'sbf-057')
  const titleSlug = slugify(rawDoc.name);
  const isTitleSlugTaken = titleSlug && (allocatedHandles instanceof Map
    ? (allocatedHandles.has(titleSlug) && allocatedHandles.get(titleSlug) !== rawDoc.id)
    : allocatedHandles.has(titleSlug));

  let finalHandle = '';
  if (titleSlug && !isTitleSlugTaken) {
    finalHandle = titleSlug;
  } else {
    // Append deterministic counter suffix: sbf-056-2, sbf-056-3...
    let counter = 2;
    while (
      allocatedHandles instanceof Map
        ? allocatedHandles.has(`${originalSlug}-${counter}`)
        : allocatedHandles.has(`${originalSlug}-${counter}`)
    ) {
      counter++;
    }
    finalHandle = `${originalSlug}-${counter}`;
  }

  if (allocatedHandles instanceof Map) allocatedHandles.set(finalHandle, rawDoc.id);
  else allocatedHandles.add(finalHandle);

  return { handle: finalHandle, isDeduplicated: true, originalSlug };
}

/**
 * Converts plain text descriptions with newlines into clean HTML paragraphs
 * @param {string} text 
 * @returns {string} HTML formatted description
 */
function formatDescriptionHtml(text) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (trimmed.startsWith('<p>') || trimmed.startsWith('<div>') || trimmed.includes('<br')) {
    return trimmed;
  }
  
  // Split on double newlines for paragraphs, and replace single newlines with <br/>
  const paragraphs = trimmed
    .split(/\r?\n\r?\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p.replace(/\r?\n/g, '<br/>')}</p>`);

  return paragraphs.join('\n');
}

/**
 * Formats price value to 2-decimal string required by Shopify
 * @param {number|string} val 
 * @returns {string} E.g. "999.00"
 */
function formatPrice(val) {
  if (val === null || val === undefined || val === '') return '0.00';
  const num = Number(val);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}

/**
 * Builds metafields array from Firestore document
 * @param {Object} rawDoc 
 * @param {Object} handleInfo
 * @returns {Array<Object>} Shopify metafield inputs
 */
function buildMetafields(rawDoc, handleInfo = null) {
  const metafields = [];

  const add = (key, value, type = 'single_line_text_field') => {
    if (value !== undefined && value !== null && value !== '') {
      metafields.push({
        namespace: 'custom',
        key,
        value: typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value),
        type
      });
    }
  };

  // Standard Fashion Attributes
  add('fabric', rawDoc.fabric);
  add('fit', rawDoc.fit);
  add('occasion', rawDoc.occasion);
  add('pattern', rawDoc.pattern);
  add('feeding_friendly', rawDoc.feedingFriendly, 'boolean');
  add('maternity', rawDoc.maternity, 'boolean');
  add('short_description', rawDoc.shortDescription, 'multi_line_text_field');

  // Care Instructions (Array or String)
  if (Array.isArray(rawDoc.careInstructions) && rawDoc.careInstructions.length > 0) {
    add('care_instructions', JSON.stringify(rawDoc.careInstructions), 'list.single_line_text_field');
  } else if (typeof rawDoc.careInstructions === 'string' && rawDoc.careInstructions.trim()) {
    add('care_instructions', rawDoc.careInstructions.trim());
  }

  // Extended Fashion Catalog Attributes found in Firestore
  add('neck_style', rawDoc.neckStyle);
  add('sleeve_length', rawDoc.sleeveLength);
  add('length', rawDoc.length);
  add('gender', rawDoc.gender);
  add('subcategory', rawDoc.subcategory);
  add('category_slug', rawDoc.categorySlug);
  add('shipping_info', rawDoc.shippingInfo, 'multi_line_text_field');
  add('return_policy', rawDoc.returnPolicy, 'multi_line_text_field');

  if (Array.isArray(rawDoc.highlights) && rawDoc.highlights.length > 0) {
    add('highlights', JSON.stringify(rawDoc.highlights), 'list.single_line_text_field');
  }

  // System link back to Firestore
  if (rawDoc.id) {
    add('firestore_id', rawDoc.id);
  }
  if (rawDoc.slug) {
    add('original_slug', rawDoc.slug);
  }

  if (handleInfo?.isDeduplicated) {
    add('handle_resolution', `deduplicated_from_${handleInfo.originalSlug}`);
  }

  return metafields;
}

/**
 * Builds tags array
 * @param {Object} rawDoc 
 * @returns {Array<string>}
 */
function buildTags(rawDoc) {
  const tagSet = new Set();

  if (Array.isArray(rawDoc.tags)) {
    rawDoc.tags.forEach(t => {
      if (t && typeof t === 'string' && t.trim()) {
        tagSet.add(t.trim().toLowerCase());
      }
    });
  }

  // Add boolean status flags as tags
  if (rawDoc.newArrival === true) tagSet.add('new-arrival');
  if (rawDoc.bestSeller === true) tagSet.add('best-seller');
  if (rawDoc.featured === true) tagSet.add('featured');
  if (rawDoc.feedingFriendly === true) tagSet.add('feeding-friendly');
  if (rawDoc.maternity === true) tagSet.add('maternity');

  // Add categories as tags
  if (rawDoc.categoryName) tagSet.add(`category:${rawDoc.categoryName.toLowerCase()}`);
  if (rawDoc.subcategory) tagSet.add(`subcategory:${rawDoc.subcategory.toLowerCase()}`);

  return Array.from(tagSet);
}

/**
 * Main Product Mapper
 * Transforms a Firestore product into Shopify product input and inventory metadata
 * 
 * @param {Object} rawDoc Raw Firestore product document
 * @param {Object} options Mapper options
 * @param {Map<string, string>|Set<string>} options.allocatedHandles Registry of handles to detect and resolve collisions
 * @returns {Object} Mapped product ready for Shopify GraphQL API
 */
function mapFirestoreToShopify(rawDoc, options = {}) {
  const title = (rawDoc.name || rawDoc.slug || 'Untitled Product').trim();
  const descriptionHtml = formatDescriptionHtml(rawDoc.description || rawDoc.shortDescription || '');
  const vendor = (rawDoc.brand || 'YEZ BEE').trim();
  const productType = (rawDoc.productType || rawDoc.categoryName || 'Apparel').trim();

  // Resolve unique deterministic handle
  const handleInfo = resolveUniqueHandle(rawDoc, options.allocatedHandles || null);
  const handle = handleInfo.handle;

  // Status mapping
  const isActive = rawDoc.isActive !== false && rawDoc.status === 'PUBLISHED';
  const status = isActive ? 'ACTIVE' : 'DRAFT';

  // Process Images via Cloudinary Service
  const imageResult = cloudinaryService.processImages(rawDoc.images, title);

  // SEO
  const seo = {
    title: (rawDoc.seo?.title || `${title} | ${vendor}`).trim(),
    description: (rawDoc.seo?.description || rawDoc.shortDescription || title).trim()
  };

  // Metafields
  const metafields = buildMetafields(rawDoc, handleInfo);

  // Tags
  const tags = buildTags(rawDoc);

  // Determine Product Options & Variants
  // Critical Fashion Requirement: The SKU for ALL variants of this product MUST BE PRESERVED EXACTLY AS STORED.
  const commonSku = (rawDoc.variants?.[0]?.sku || rawDoc.name || handle).trim();

  // Detect colors
  const primaryColor = rawDoc.colors?.[0]?.name || rawDoc.variants?.[0]?.color || null;
  const hasMultipleColors = Array.isArray(rawDoc.colors) && rawDoc.colors.length > 1;

  // Collect unique sizes
  const rawSizes = Array.isArray(rawDoc.sizes) && rawDoc.sizes.length > 0
    ? rawDoc.sizes
    : (Array.isArray(rawDoc.variants) ? rawDoc.variants.map(v => v.size).filter(Boolean) : ['One Size']);

  const uniqueSizes = Array.from(new Set(rawSizes));

  // Determine Options
  const productOptions = [];
  const hasColorOption = Boolean(primaryColor);

  if (hasColorOption) {
    const colorValues = hasMultipleColors
      ? rawDoc.colors.map(c => ({ name: c.name.trim() }))
      : [{ name: primaryColor.trim() }];
    productOptions.push({
      name: 'Color',
      values: colorValues
    });
  }

  productOptions.push({
    name: 'Size',
    values: uniqueSizes.map(s => ({ name: String(s).trim() }))
  });

  // Build Variants
  const mappedVariants = [];
  const rawVariants = Array.isArray(rawDoc.variants) && rawDoc.variants.length > 0 ? rawDoc.variants : null;

  if (rawVariants) {
    for (const v of rawVariants) {
      const sizeName = String(v.size || 'One Size').trim();
      const colorName = String(v.color || primaryColor || '').trim();

      const optionValues = [];
      if (hasColorOption && colorName) {
        optionValues.push({ optionName: 'Color', name: colorName });
      }
      optionValues.push({ optionName: 'Size', name: sizeName });

      // IMPORTANT: Keep exact same SKU from Firestore variant or product name
      const variantSku = (v.sku || commonSku).trim();

      const variantPrice = formatPrice(v.price || rawDoc.price);
      const comparePrice = v.compareAtPrice || rawDoc.compareAtPrice;

      mappedVariants.push({
        sku: variantSku, // EXACT SKU - PRESERVED AS STORED IN FIRESTORE
        price: variantPrice,
        compareAtPrice: comparePrice ? formatPrice(comparePrice) : null,
        optionValues,
        stockQuantity: Number.isInteger(v.stock) ? Math.max(0, v.stock) : 0,
        lowStockThreshold: v.lowStockThreshold || null,
        isActive: v.isActive !== false,
        size: sizeName,
        color: colorName
      });
    }
  } else {
    // Fallback if no variants array in Firestore document
    for (const sizeName of uniqueSizes) {
      const optionValues = [];
      if (hasColorOption && primaryColor) {
        optionValues.push({ optionName: 'Color', name: primaryColor.trim() });
      }
      optionValues.push({ optionName: 'Size', name: String(sizeName).trim() });

      mappedVariants.push({
        sku: commonSku, // EXACT SKU
        price: formatPrice(rawDoc.price),
        compareAtPrice: rawDoc.compareAtPrice ? formatPrice(rawDoc.compareAtPrice) : null,
        optionValues,
        stockQuantity: Math.max(0, Number(rawDoc.stock) || 0),
        isActive: true,
        size: String(sizeName).trim(),
        color: primaryColor
      });
    }
  }

  // Calculate total stock
  const totalStock = mappedVariants.reduce((sum, v) => sum + v.stockQuantity, 0);

  return {
    firestoreDocId: rawDoc.id,
    title,
    handle,
    originalSlug: handleInfo.originalSlug,
    isHandleDeduplicated: handleInfo.isDeduplicated,
    descriptionHtml,
    vendor,
    productType,
    status,
    tags,
    seo,
    metafields,
    productOptions,
    variants: mappedVariants,
    images: imageResult.validImages,
    imageWarnings: imageResult.warnings,
    failedImageCount: imageResult.failedCount,
    totalStock,
    commonSku
  };
}

module.exports = {
  mapFirestoreToShopify,
  resolveUniqueHandle,
  slugify,
  formatDescriptionHtml,
  formatPrice,
  buildMetafields,
  buildTags,
  matchShopifyVariantToSource,
  matchSourceVariantToShopify,
  extractShopifyVariantOptions,
  normalize
};
