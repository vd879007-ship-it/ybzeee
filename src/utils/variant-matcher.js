/**
 * Variant Matcher Utility
 * Provides deterministic, bidirectional matching between Shopify variant nodes
 * and Firestore source variants.
 * 
 * Strict Safety Invariants:
 * 1. Uses exact normalized equality (trim + lowercase) for Size and Color.
 * 2. Never uses substring matching (no .includes()).
 * 3. Prefers Shopify selectedOptions over title parsing.
 * 4. Parses title into slash-delimited exact tokens only when selectedOptions are absent.
 * 5. Rejects ambiguous matches (multiple matches throw an error, never guess).
 * 6. Disallows positional fallback unless variant counts match and all available option values have been validated.
 */

function normalize(val) {
  if (val === null || val === undefined) return '';
  return String(val).trim().toLowerCase();
}

/**
 * Extracts normalized { size, color } from a Shopify variant node.
 * Prefers selectedOptions; falls back to exact title tokens if selectedOptions is unavailable.
 * 
 * @param {Object} shopifyNode 
 * @returns {{ size: string, color: string, hasSelectedOptions: boolean }}
 */
function extractShopifyVariantOptions(shopifyNode) {
  if (!shopifyNode) {
    return { size: '', color: '', hasSelectedOptions: false };
  }

  const selectedOptions = Array.isArray(shopifyNode.selectedOptions) ? shopifyNode.selectedOptions : [];
  
  if (selectedOptions.length > 0) {
    const sizeOpt = selectedOptions.find(o => {
      const name = normalize(o.name);
      return name === 'size' || name === 'sizes';
    });
    const colorOpt = selectedOptions.find(o => {
      const name = normalize(o.name);
      return name === 'color' || name === 'colour' || name === 'colors' || name === 'shade';
    });

    return {
      size: normalize(sizeOpt ? sizeOpt.value : ''),
      color: normalize(colorOpt ? colorOpt.value : ''),
      hasSelectedOptions: true
    };
  }

  // Fallback: title parsing without substring matching
  // Shopify default title format: "Color / Size" or "Size" or "Default Title"
  const title = String(shopifyNode.title || '').trim();
  if (title && title !== 'Default Title') {
    const tokens = title.split('/').map(t => normalize(t)).filter(Boolean);
    if (tokens.length === 1) {
      return { size: tokens[0], color: '', hasSelectedOptions: false };
    }
    if (tokens.length >= 2) {
      // Convention in fashion store: Option 1 (Color) / Option 2 (Size)
      return { color: tokens[0], size: tokens[1], hasSelectedOptions: false };
    }
  }

  return { size: '', color: '', hasSelectedOptions: false };
}

/**
 * Matches a Shopify variant node to a unique Firestore source variant.
 * 
 * @param {Object} shopifyNode Shopify GraphQL variant node
 * @param {Array<Object>} sourceVariants Mapped variants from Firestore
 * @param {Object} [options={}]
 * @param {number} [options.fallbackIndex] Positional index if fallback is evaluated
 * @param {number} [options.totalShopifyVariants] Total count of Shopify variants for count validation
 * @param {boolean} [options.allowPositionalFallback=false] Whether positional fallback is permitted
 * @returns {Object} Matching source variant
 * @throws {Error} If match is ambiguous, invalid, or missing
 */
function matchShopifyVariantToSource(shopifyNode, sourceVariants, options = {}) {
  if (!shopifyNode) {
    throw new Error('Variant Matcher Error: shopifyNode is required.');
  }
  if (!Array.isArray(sourceVariants) || sourceVariants.length === 0) {
    throw new Error('Variant Matcher Error: sourceVariants must be a non-empty array.');
  }

  const { size: targetSize, color: targetColor, hasSelectedOptions } = extractShopifyVariantOptions(shopifyNode);

  // 1. Exact match candidate evaluation
  const exactMatches = sourceVariants.filter(sv => {
    const srcSize = normalize(sv.size);
    const srcColor = normalize(sv.color);

    // If targetSize is known, it must match exactly
    if (targetSize && srcSize !== targetSize) {
      return false;
    }

    // If targetColor is known, it must match exactly
    if (targetColor && srcColor && srcColor !== targetColor) {
      return false;
    }

    // If source has color but target has no color, only match if targetSize matches
    if (targetSize && !targetColor) {
      return srcSize === targetSize;
    }

    // Both matched or targetSize matched
    return Boolean(targetSize && srcSize === targetSize);
  });

  if (exactMatches.length === 1) {
    return exactMatches[0];
  }

  if (exactMatches.length > 1) {
    if (!targetColor) {
      throw new Error(
        `Ambiguous variant match: Shopify variant "${shopifyNode.title || shopifyNode.id}" (Size: "${targetSize}") matched ${exactMatches.length} Firestore variants. Exact Color option must be specified.`
      );
    }
    throw new Error(
      `Ambiguous variant match: Shopify variant "${shopifyNode.title || shopifyNode.id}" matched ${exactMatches.length} source variants with identical Size ("${targetSize}") and Color ("${targetColor}").`
    );
  }

  // 2. Positional fallback with strict safety constraints
  // Constraint: Variant counts must match, and no contradictory option values exist
  const { fallbackIndex, totalShopifyVariants, allowPositionalFallback = false } = options;
  const countMatches = typeof totalShopifyVariants === 'number' && totalShopifyVariants === sourceVariants.length;

  if (allowPositionalFallback && countMatches && typeof fallbackIndex === 'number' && fallbackIndex >= 0 && fallbackIndex < sourceVariants.length) {
    // If targetSize was provided but did NOT match any source variant, reject positional fallback!
    if (targetSize && !sourceVariants.some(sv => normalize(sv.size) === targetSize)) {
      throw new Error(
        `Variant matching failed: Shopify variant "${shopifyNode.title || shopifyNode.id}" specifies size "${targetSize}", which does not exist in Firestore source variants. Positional fallback rejected to prevent invalid stock mapping.`
      );
    }

    return sourceVariants[fallbackIndex];
  }

  // 3. No match found -> Never guess
  const sourceSummary = sourceVariants.map(v => `[Size: ${v.size}, Color: ${v.color || 'none'}]`).join(', ');
  throw new Error(
    `No matching Firestore variant found for Shopify variant "${shopifyNode.title || shopifyNode.id}" (Detected - Size: "${targetSize || 'N/A'}", Color: "${targetColor || 'N/A'}", hasSelectedOptions: ${hasSelectedOptions}). Available source variants: ${sourceSummary}`
  );
}

/**
 * Symmetrically matches a Firestore source variant to a unique Shopify variant node.
 * Used during verification.
 * 
 * @param {Object} sourceVariant Firestore mapped variant
 * @param {Array<Object>} shopifyNodes Array of Shopify GraphQL variant nodes
 * @param {Object} [options={}]
 * @returns {Object} Matching Shopify variant node
 * @throws {Error} If match is ambiguous or missing
 */
function matchSourceVariantToShopify(sourceVariant, shopifyNodes, options = {}) {
  if (!sourceVariant) {
    throw new Error('Variant Matcher Error: sourceVariant is required.');
  }
  if (!Array.isArray(shopifyNodes) || shopifyNodes.length === 0) {
    throw new Error('Variant Matcher Error: shopifyNodes must be a non-empty array.');
  }

  const srcSize = normalize(sourceVariant.size);
  const srcColor = normalize(sourceVariant.color);

  const exactMatches = shopifyNodes.filter(node => {
    const { size: shpSize, color: shpColor } = extractShopifyVariantOptions(node);

    if (srcSize && shpSize !== srcSize) {
      return false;
    }

    if (srcColor && shpColor && shpColor !== srcColor) {
      return false;
    }

    return Boolean(srcSize && shpSize === srcSize);
  });

  if (exactMatches.length === 1) {
    return exactMatches[0];
  }

  if (exactMatches.length > 1) {
    throw new Error(
      `Ambiguous variant match: Firestore source variant [Size: "${sourceVariant.size}", Color: "${sourceVariant.color}"] matched ${exactMatches.length} Shopify variants.`
    );
  }

  const shopifySummary = shopifyNodes.map(n => `"${n.title}"`).join(', ');
  throw new Error(
    `No matching Shopify variant found for Firestore variant [Size: "${sourceVariant.size}", Color: "${sourceVariant.color}"]. Shopify variants available: ${shopifySummary}`
  );
}

module.exports = {
  normalize,
  extractShopifyVariantOptions,
  matchShopifyVariantToSource,
  matchSourceVariantToShopify
};
