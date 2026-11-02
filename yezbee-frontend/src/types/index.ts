export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: Category;
  brand: string;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  features: string[];
  careInstructions: string[];
  isNew: boolean;
  isTrending: boolean;
  isOnSale: boolean;
  saleDiscount: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  _id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  _id: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  images: string[];
  isAvailable: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent: string | null;
  subcategories: Category[];
  filters: Filter[];
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface Filter {
  _id: string;
  name: string;
  key: string;
  type: 'checkbox' | 'radio' | 'range' | 'color';
  options: FilterOption[];
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
  colorHex?: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  wishlist: string[];
  orders: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentInfo: PaymentInfo;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  couponApplied: Coupon | null;
  total: number;
  status: OrderStatus;
  statusHistory: StatusUpdate[];
  notes: string;
  estimatedDelivery: string;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  priceAtPurchase: number;
  totalPrice: number;
}

export interface PaymentInfo {
  method: PaymentMethod;
  transactionId: string;
  status: PaymentStatus;
  paidAt: string | null;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentMethod = 'cod' | 'card' | 'upi' | 'netbanking' | 'wallet';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface StatusUpdate {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface CartItem {
  _id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
  product: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minCartValue: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  startsAt: string;
  expiresAt: string;
  applicableCategories: string[];
  applicableProducts: string[];
}

export interface ProductFilters {
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRange: [number, number];
  brands: string[];
  rating: number | null;
  sortBy: SortOption;
  search: string;
  page: number;
  limit: number;
}

export type SortOption =
  | 'newest'
  | 'price_low_high'
  | 'price_high_low'
  | 'rating'
  | 'popular'
  | 'name_az'
  | 'name_za';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface WishlistItem {
  _id: string;
  product: Product;
  addedAt: string;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface CheckoutState {
  shippingAddress: ShippingInfo;
  billingSameAsShipping: boolean;
  billingAddress: ShippingInfo;
  paymentMethod: PaymentMethod;
  couponCode: string;
  notes: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  ogType: string;
}
