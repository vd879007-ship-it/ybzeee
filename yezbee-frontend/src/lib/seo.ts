interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  originalPrice?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
  brand?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  color?: string;
  sizes?: string[];
  fabric?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  title?: string;
  body?: string;
  date?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface MetaTag {
  property?: string;
  name?: string;
  content: string;
}

interface MetaTagsInput {
  title: string;
  description: string;
  ogImage?: string;
  url?: string;
  keywords?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

const SITE_NAME = 'YEZ BEE Fashion';
const SITE_URL = 'https://yezbeefashion.com';
const DEFAULT_OG_IMAGE = 'https://yezbeefashion.com/images/og-default.jpg';
const ORGANIZATION_NAME = 'YEZ BEE Fashion';
const ORGANIZATION_LOGO = 'https://yezbeefashion.com/images/logo.png';

export function generateProductJsonLd(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/products/${product.slug}`,
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'YEZ BEE Fashion',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: product.currency || 'INR',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      ...(product.originalPrice && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: product.originalPrice,
          priceCurrency: product.currency || 'INR',
        },
      }),
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      },
    }),
    ...(product.category && {
      category: product.category,
    }),
  };
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: ORGANIZATION_NAME,
    url: SITE_URL,
    logo: ORGANIZATION_LOGO,
    sameAs: [
      'https://www.facebook.com/share/1GoBY9GSPB/',
      'https://www.instagram.com/yezbeefashion?igsi=MTRwZm1rNzdrc2h0bw==',
      'https://pinterest.com/yezbeefashion',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-XXXX-XXXXXX',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi'],
    },
  };
}

export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: 'Luxury women\'s fashion — curated elegance for the modern woman.',
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateReviewJsonLd(reviews: Review[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
      },
      ...(review.title && { name: review.title }),
      ...(review.body && { reviewBody: review.body }),
      ...(review.date && { datePublished: review.date }),
    })),
  };
}

export function generateFAQJsonLd(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateMetaTags({
  title,
  description,
  ogImage,
  url,
  keywords,
  noindex,
  nofollow,
  canonical,
}: MetaTagsInput): MetaTag[] {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const pageUrl = url ? (url.startsWith('http') ? url : `${SITE_URL}${url}`) : SITE_URL;
  const imageUrl = ogImage || DEFAULT_OG_IMAGE;

  const tags: MetaTag[] = [
    { name: 'description', content: description },
    { name: 'title', content: fullTitle },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:image', content: imageUrl },
    { property: 'og:url', content: pageUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ];

  if (keywords) {
    tags.push({ name: 'keywords', content: keywords });
  }

  if (noindex) {
    tags.push({ name: 'robots', content: 'noindex' });
  } else if (nofollow) {
    tags.push({ name: 'robots', content: 'nofollow' });
  } else {
    tags.push({ name: 'robots', content: 'index, follow' });
  }

  if (canonical) {
    tags.push({ name: 'canonical', content: canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical}` });
  }

  return tags;
}
