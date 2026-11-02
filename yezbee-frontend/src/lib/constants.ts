export const SITE_NAME = 'YEZ BEE Fashion';
export const SITE_DESCRIPTION = 'Luxury women\'s fashion — curated elegance for the modern woman. Discover exquisite Indian and contemporary wear.';
export const SITE_URL = 'https://yezbeefashion.com';
export const SITE_EMAIL = 'hello@yezbeefashion.com';
export const SITE_PHONE = '+91 1800-XXX-XXXX';

export const NAV_LINKS = [
  { label: 'New Arrivals', href: '/collections/new-arrivals', highlight: true },
  { label: 'Sarees', href: '/collections/sarees' },
  { label: 'Lehengas', href: '/collections/lehengas' },
  { label: 'Gowns', href: '/collections/western-gowns' },
  { label: 'Indo-Western', href: '/collections/indo-western' },
  { label: 'Accessories', href: '/collections/accessories' },
  { label: 'Sale', href: '/collections/sale', highlight: true },
] as const;

export const CATEGORIES = [
  { id: 'sarees', name: 'Sarees', slug: 'sarees', image: '/images/categories/sarees.jpg', count: 120 },
  { id: 'lehengas', name: 'Lehengas', slug: 'lehengas', image: '/images/categories/lehengas.jpg', count: 85 },
  { id: 'western-gowns', name: 'Western Gowns', slug: 'western-gowns', image: '/images/categories/gowns.jpg', count: 64 },
  { id: 'indo-western', name: 'Indo-Western', slug: 'indo-western', image: '/images/categories/indo-western.jpg', count: 48 },
  { id: 'anarkalis', name: 'Anarkalis', slug: 'anarkalis', image: '/images/categories/anarkalis.jpg', count: 56 },
  { id: 'kurtas', name: 'Kurtas & Tunics', slug: 'kurtas', image: '/images/categories/kurtas.jpg', count: 92 },
  { id: 'blouses', name: 'Blouses', slug: 'blouses', image: '/images/categories/blouses.jpg', count: 110 },
  { id: 'accessories', name: 'Accessories', slug: 'accessories', image: '/images/categories/accessories.jpg', count: 200 },
] as const;

export const FILTER_OPTIONS = {
  priceRange: {
    label: 'Price Range',
    min: 0,
    max: 100000,
    steps: [
      { label: 'Under ₹2,500', min: 0, max: 2500 },
      { label: '₹2,500 - ₹5,000', min: 2500, max: 5000 },
      { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
      { label: '₹10,000 - ₹25,000', min: 10000, max: 25000 },
      { label: '₹25,000 - ₹50,000', min: 25000, max: 50000 },
      { label: 'Above ₹50,000', min: 50000, max: 100000 },
    ],
  },
  colors: [
    { label: 'Red', value: 'red', hex: '#DC2626' },
    { label: 'Pink', value: 'pink', hex: '#EC4899' },
    { label: 'Maroon', value: 'maroon', hex: '#800020' },
    { label: 'Gold', value: 'gold', hex: '#D4AF37' },
    { label: 'Green', value: 'green', hex: '#16A34A' },
    { label: 'Blue', value: 'blue', hex: '#2563EB' },
    { label: 'Navy', value: 'navy', hex: '#1E3A5F' },
    { label: 'Purple', value: 'purple', hex: '#7C3AED' },
    { label: 'White', value: 'white', hex: '#FFFFFF' },
    { label: 'Black', value: 'black', hex: '#000000' },
    { label: 'Beige', value: 'beige', hex: '#F5F5DC' },
    { label: 'Orange', value: 'orange', hex: '#EA580C' },
    { label: 'Yellow', value: 'yellow', hex: '#EAB308' },
    { label: 'Silver', value: 'silver', hex: '#C0C0C0' },
    { label: 'Multicolor', value: 'multicolor', hex: 'linear-gradient' },
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'],
  fabrics: [
    { label: 'Silk', value: 'silk' },
    { label: 'Cotton', value: 'cotton' },
    { label: 'Georgette', value: 'georgette' },
    { label: 'Chiffon', value: 'chiffon' },
    { label: 'Velvet', value: 'velvet' },
    { label: 'Lace', value: 'lace' },
    { label: 'Organza', value: 'organza' },
    { label: 'Net', value: 'net' },
    { label: 'Satin', value: 'satin' },
    { label: 'Crepe', value: 'crepe' },
    { label: 'Linen', value: 'linen' },
    { label: 'Polyester', value: 'polyester' },
  ],
  occasions: [
    { label: 'Wedding', value: 'wedding' },
    { label: 'Engagement', value: 'engagement' },
    { label: 'Reception', value: 'reception' },
    { label: 'Mehendi', value: 'mehendi' },
    { label: 'Sangeet', value: 'sangeet' },
    { label: 'Haldi', value: 'haldi' },
    { label: 'Festival', value: 'festival' },
    { label: 'Party', value: 'party' },
    { label: 'Office Wear', value: 'office-wear' },
    { label: 'Casual', value: 'casual' },
    { label: 'Cocktail', value: 'cocktail' },
    { label: 'Bridal Shower', value: 'bridal-shower' },
  ],
  ratings: [
    { label: '4★ & above', value: 4 },
    { label: '3★ & above', value: 3 },
    { label: '2★ & above', value: 2 },
  ],
  discount: [
    { label: '10% or more', value: 10 },
    { label: '20% or more', value: 20 },
    { label: '30% or more', value: 30 },
    { label: '40% or more', value: 40 },
    { label: '50% or more', value: 50 },
    { label: '60% or more', value: 60 },
  ],
  availability: [
    { label: 'All', value: 'all' },
    { label: 'In Stock', value: 'in_stock' },
    { label: 'Out of Stock', value: 'out_of_stock' },
  ],
} as const;

export const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Popularity', value: 'popular' },
  { label: 'Best Rating', value: 'rating' },
  { label: 'Discount', value: 'discount' },
] as const;

export const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard Delivery', description: '5-7 business days', price: 699, freeAbove: 15000 },
  { id: 'express', name: 'Express Delivery', description: '2-3 business days', price: 1299, freeAbove: 25000 },
  { id: 'overnight', name: 'Overnight Delivery', description: 'Next business day', price: 2499, freeAbove: 50000 },
] as const;

export const PAYMENT_METHODS = [
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive', icon: 'cash' },
  { id: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard, RuPay', icon: 'card' },
  { id: 'upi', name: 'UPI', description: 'Google Pay, PhonePe, Paytm', icon: 'upi' },
  { id: 'netbanking', name: 'Net Banking', description: 'All major banks', icon: 'bank' },
  { id: 'wallet', name: 'Wallet', description: 'Paytm, Mobikwik, Freecharge', icon: 'wallet' },
] as const;

export const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
] as const;

export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/yezbeefashion?igsi=MTRwZm1rNzdrc2h0bw==', icon: 'instagram' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1GoBY9GSPB/', icon: 'facebook' },
  { label: 'Pinterest', href: 'https://pinterest.com/yezbeefashion', icon: 'pinterest' },
  { label: 'YouTube', href: 'https://youtube.com/@yezbeefashion', icon: 'youtube' },
] as const;

export const FOOTER_LINKS = {
  shop: {
    title: 'Shop',
    links: [
      { label: 'New Arrivals', href: '/collections/new-arrivals' },
      { label: 'Sarees', href: '/collections/sarees' },
      { label: 'Lehengas', href: '/collections/lehengas' },
      { label: 'Gowns', href: '/collections/western-gowns' },
      { label: 'Indo-Western', href: '/collections/indo-western' },
      { label: 'Blouses', href: '/collections/blouses' },
      { label: 'Accessories', href: '/collections/accessories' },
      { label: 'Sale', href: '/collections/sale' },
    ],
  },
  customerService: {
    title: 'Customer Service',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'Shipping & Delivery', href: '/shipping' },
      { label: 'Returns & Exchanges', href: '/returns' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'Track Order', href: '/track-order' },
    ],
  },
  about: {
    title: 'About',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Sustainability', href: '/sustainability' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  policies: {
    title: 'Policies',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy', href: '/refund' },
      { label: 'Cookie Policy', href: '/cookies' },
    ],
  },
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  locale: 'en-IN',
} as const;
