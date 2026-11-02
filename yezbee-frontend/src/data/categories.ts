export const CATEGORY_CONFIG = {
  casuals: {
    label: "Casuals",
    subcategories: ["feeding", "non-feeding"]
  },
  "party-wear": {
    label: "Party Wear",
    subcategories: ["feeding", "non-feeding"]
  },
  "ethnic-wear": {
    label: "Ethnic Wear",
    subcategories: ["feeding", "non-feeding"]
  },
  "lounge-wear": {
    label: "Lounge Wear",
    subcategories: []
  },
  "peplum-tops": {
    label: "Peplum Tops",
    subcategories: ["feeding", "non-feeding"]
  },
  "kids-wear": {
    label: "Kids Wear",
    subcategories: []
  }
} as const;

export type CategorySlug = keyof typeof CATEGORY_CONFIG;

export interface SubcategoryConfig {
  id: string;
  name: string;
  slug: string;
  path: string;
  productType: 'FEEDING' | 'NON-FEEDING';
  description: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  slug: string;
  path: string;
  description: string;
  image: string;
  banner?: string;
  sortOrder: number;
  hasFeedingSplit: boolean;
  subcategories: SubcategoryConfig[];
  itemCount?: string;
}

export const YEZBEE_CATEGORIES: CategoryConfig[] = [
  {
    id: 'casuals',
    name: 'CASUALS',
    slug: 'casuals',
    path: '/category/casuals',
    description: 'Effortless everyday styles designed for comfort and elegance.',
    image: '/images/hero/hero1.png',
    banner: '/images/hero/hero1.png',
    sortOrder: 1,
    hasFeedingSplit: true,
    subcategories: [
      {
        id: 'casuals-feeding',
        name: 'FEEDING',
        slug: 'feeding',
        path: '/category/casuals/feeding',
        productType: 'FEEDING',
        description: 'Everyday casual outfits crafted with discreet concealed feeding zippers.',
      },
      {
        id: 'casuals-non-feeding',
        name: 'NON-FEEDING',
        slug: 'non-feeding',
        path: '/category/casuals/non-feeding',
        productType: 'NON-FEEDING',
        description: 'Everyday casual kurtis, tops, and dresses with standard non-feeding silhouettes.',
      },
    ],
  },
  {
    id: 'party-wear',
    name: 'PARTY WEAR',
    slug: 'party-wear',
    path: '/category/party-wear',
    description: 'Glamorous evening dresses, flared gowns, and festive party outfits.',
    image: '/images/hero/hero2.png',
    banner: '/images/hero/hero2.png',
    sortOrder: 2,
    hasFeedingSplit: true,
    subcategories: [
      {
        id: 'party-wear-feeding',
        name: 'FEEDING',
        slug: 'feeding',
        path: '/category/party-wear/feeding',
        productType: 'FEEDING',
        description: 'Elegant party wear featuring hidden nursing access for celebrations.',
      },
      {
        id: 'party-wear-non-feeding',
        name: 'NON-FEEDING',
        slug: 'non-feeding',
        path: '/category/party-wear/non-feeding',
        productType: 'NON-FEEDING',
        description: 'Designer party dresses and gowns with regular silhouettes.',
      },
    ],
  },
  {
    id: 'ethnic-wear',
    name: 'ETHNIC WEAR',
    slug: 'ethnic-wear',
    path: '/category/ethnic-wear',
    description: 'Timeless traditional ethnic silk sarees, lehengas, and handcrafted ethnic ensembles.',
    image: '/images/hero/hero3.png',
    banner: '/images/hero/hero3.png',
    sortOrder: 3,
    hasFeedingSplit: true,
    subcategories: [
      {
        id: 'ethnic-wear-feeding',
        name: 'FEEDING',
        slug: 'feeding',
        path: '/category/ethnic-wear/feeding',
        productType: 'FEEDING',
        description: 'Traditional ethnic kurtas and festive sets featuring discreet feeding access.',
      },
      {
        id: 'ethnic-wear-non-feeding',
        name: 'NON-FEEDING',
        slug: 'non-feeding',
        path: '/category/ethnic-wear/non-feeding',
        productType: 'NON-FEEDING',
        description: 'Handcrafted sarees, festive lehengas, and regular ethnic ensembles.',
      },
    ],
  },
  {
    id: 'lounge-wear',
    name: 'LOUNGE WEAR',
    slug: 'lounge-wear',
    path: '/category/lounge-wear',
    description: 'Pure cotton night suits, comfortable lounge sets, and cozy home wear.',
    image: '/images/hero/hero4.png',
    banner: '/images/hero/hero4.png',
    sortOrder: 4,
    hasFeedingSplit: false,
    subcategories: [],
  },
  {
    id: 'peplum-tops',
    name: 'PEPLUM TOPS',
    slug: 'peplum-tops',
    path: '/category/peplum-tops',
    description: 'Chic flared peplum tops, tunics, and modern waist-accentuated tops.',
    image: '/images/hero/hero1.png',
    banner: '/images/hero/hero1.png',
    sortOrder: 5,
    hasFeedingSplit: true,
    subcategories: [
      {
        id: 'peplum-tops-feeding',
        name: 'FEEDING',
        slug: 'feeding',
        path: '/category/peplum-tops/feeding',
        productType: 'FEEDING',
        description: 'Peplum tunics with discrete nursing zips for seamless feeding access.',
      },
      {
        id: 'peplum-tops-non-feeding',
        name: 'PEPLUM NON-FEEDING',
        slug: 'non-feeding',
        path: '/category/peplum-tops/non-feeding',
        productType: 'NON-FEEDING',
        description: 'Contemporary peplum tops designed for standard styling.',
      },
    ],
  },
  {
    id: 'kids-wear',
    name: 'KIDS WEAR',
    slug: 'kids-wear',
    path: '/category/kids-wear',
    description: 'Soft hypoallergenic children outfits, cotton dresses, and festive wear.',
    image: '/images/hero/hero2.png',
    banner: '/images/hero/hero2.png',
    sortOrder: 6,
    hasFeedingSplit: false,
    subcategories: [],
  },
];

const LEGACY_SLUG_MAP: Record<string, { categorySlug: string; productType?: 'FEEDING' | 'NON-FEEDING' }> = {
  'maternity-kurtis': { categorySlug: 'casuals', productType: 'FEEDING' },
  'maternity-feeding-loungewears': { categorySlug: 'lounge-wear', productType: 'FEEDING' },
  'maternity-intimatewears': { categorySlug: 'lounge-wear', productType: 'FEEDING' },
  'non-maternity-kurtis-dresses': { categorySlug: 'casuals', productType: 'NON-FEEDING' },
  'kids-clothing': { categorySlug: 'kids-wear' },
  'loungewear': { categorySlug: 'lounge-wear', productType: 'NON-FEEDING' },
};

export function resolveLegacyCategorySlug(slug: string): { categorySlug: string; productType?: 'FEEDING' | 'NON-FEEDING' } | undefined {
  const normalized = slug.toLowerCase().trim();
  return LEGACY_SLUG_MAP[normalized];
}

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  const normalized = slug.toLowerCase().trim();
  const directMatch = YEZBEE_CATEGORIES.find(
    (c) => c.slug === normalized || c.id === normalized
  );
  if (directMatch) return directMatch;

  const legacy = resolveLegacyCategorySlug(normalized);
  if (legacy) {
    return YEZBEE_CATEGORIES.find((c) => c.slug === legacy.categorySlug);
  }
  return undefined;
}

export function getCategoryWithSubcategory(
  categorySlug: string,
  subSlug?: string
): { category: CategoryConfig; subcategory?: SubcategoryConfig } | undefined {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return undefined;

  if (!subSlug) return { category };

  const subNormalized = subSlug.toLowerCase().trim();
  const subcategory = category.subcategories.find(
    (s) => s.slug === subNormalized || s.id === subNormalized || s.productType.toLowerCase() === subNormalized
  );

  return { category, subcategory };
}

export function hasFeedingSplit(categorySlug: string): boolean {
  const cat = getCategoryBySlug(categorySlug);
  return cat ? cat.hasFeedingSplit : false;
}

export function getAllCategorySlugs(): string[] {
  const slugs: string[] = [];
  YEZBEE_CATEGORIES.forEach((cat) => {
    slugs.push(cat.slug);
    cat.subcategories.forEach((sub) => {
      slugs.push(`${cat.slug}/${sub.slug}`);
    });
  });
  return slugs;
}
