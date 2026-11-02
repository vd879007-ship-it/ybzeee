const fs = require('fs');
const path = require('path');
const firestoreService = require('../services/firestore.service');
const checkpointManager = require('../utils/checkpoint');
const { getSafeImageUrl } = require('../services/cloudinary.service');

async function exportCatalog() {
  console.log('Fetching Firestore products...');
  const firestoreProducts = await firestoreService.getAllProducts();
  const checkpoint = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../checkpoint.json'), 'utf8'));
  const migratedMap = checkpoint.migrated || {};

  console.log(`Retrieved ${firestoreProducts.length} Firestore products.`);
  console.log(`Found ${Object.keys(migratedMap).length} migrated checkpoint records.`);

  const catalog = firestoreProducts.map((doc) => {
    const cp = migratedMap[doc.id] || {};
    const handle = cp.handle || doc.slug || (doc.name ? doc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : doc.id);
    const shopifyId = cp.shopifyProductId || doc.id;

    // Filter valid Cloudinary images
    const rawImages = Array.isArray(doc.images) ? doc.images : [];
    const cleanImages = rawImages
      .map(img => (typeof img === 'string' ? img : img?.url || img?.secure_url || ''))
      .filter(url => Boolean(url && url.startsWith('http')));

    const primaryImage = cleanImages[0] || (typeof doc.thumbnail === 'string' ? doc.thumbnail : '') || '/images/hero/hero1.png';

    // Format variants
    const rawVariants = Array.isArray(doc.variants) ? doc.variants : [];
    const variants = rawVariants.map((v, idx) => {
      return {
        id: v._id || `${shopifyId}-var-${idx}`,
        sku: v.sku || doc.sku || '',
        size: v.size || 'Free Size',
        color: v.color || 'Standard',
        stock: typeof v.stock === 'number' ? v.stock : 0,
        price: typeof v.price === 'number' ? v.price : Number(doc.price) || 999,
        compareAtPrice: typeof v.compareAtPrice === 'number' ? v.compareAtPrice : (doc.compareAtPrice ? Number(doc.compareAtPrice) : null),
        isActive: (v.stock || 0) > 0,
      };
    });

    const sizes = Array.from(new Set(variants.map(v => v.size))).filter(Boolean);
    const colors = Array.from(new Set(variants.map(v => v.color))).map(name => ({
      name,
      hex: '#D4AF37'
    }));

    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const price = variants[0]?.price || Number(doc.price) || 999;
    const compareAtPrice = variants[0]?.compareAtPrice || (doc.compareAtPrice ? Number(doc.compareAtPrice) : null);
    const discountPercentage = compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;

    const rawCategory = (doc.category || 'casuals').toLowerCase().trim();
    const productType = (doc.productType || '').toUpperCase();
    const isFeeding = productType.includes('FEEDING') || rawCategory.includes('feeding');

    let category = 'casuals';
    if (rawCategory.includes('party')) category = 'party-wear';
    else if (rawCategory.includes('ethnic')) category = 'ethnic-wear';
    else if (rawCategory.includes('peplum')) category = 'peplum-tops';
    else if (rawCategory.includes('lounge')) category = 'lounge-wear';
    else if (rawCategory.includes('kids')) category = 'kids-wear';
    else category = 'casuals';

    return {
      id: shopifyId,
      slug: handle,
      name: doc.name || 'Untitled Fashion Dress',
      category,
      categoryName: category.toUpperCase().replace('-', ' '),
      productType: isFeeding ? 'FEEDING' : 'NON-FEEDING',
      subcategory: isFeeding ? 'Feeding' : 'Non-Feeding',
      shortDescription: doc.shortDescription || doc.description?.slice(0, 160) || '',
      description: doc.description || '',
      highlights: doc.features || ['Pure Breathable Fabric', 'Concealed Feeding Zippers', 'All-Day Comfort'],
      price,
      compareAtPrice,
      discountPercentage,
      currency: 'INR',
      images: cleanImages.length > 0 ? cleanImages : [primaryImage],
      thumbnail: primaryImage,
      colors: colors.length > 0 ? colors : [{ name: 'Standard', hex: '#D4AF37' }],
      variants,
      fabric: doc.fabric || '100% Pure Cotton',
      fit: 'Regular Maternity Fit',
      pattern: doc.pattern || 'Printed Kurti',
      neckStyle: 'Round Neck',
      sleeveLength: doc.sleeveLength || '3/4th Sleeve',
      length: doc.length || 'Calf Length',
      occasion: 'Casual & Maternity Wear',
      gender: 'Women',
      maternity: true,
      feedingFriendly: isFeeding,
      sizes: sizes.length > 0 ? sizes : ['M', 'L', 'XL', '2XL', '3XL'],
      stock: totalStock,
      lowStockThreshold: 3,
      rating: 4.9,
      reviewCount: 24,
      tags: doc.tags || [category, isFeeding ? 'feeding' : 'non-feeding', 'maternity'],
      careInstructions: doc.careInstructions || 'Gentle machine wash with mild detergent.',
      shippingInfo: 'Dispatched within 24 hours. Express delivery available.',
      returnPolicy: '7-day hassle-free return and exchange.',
      featured: true,
      bestseller: true,
      newArrival: true,
      status: 'published',
      active: true,
    };
  });

  const outputPath = path.resolve(__dirname, '../../yezbee-frontend/src/data/catalog.json');
  fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`Exported ${catalog.length} products to ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
}

exportCatalog().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
