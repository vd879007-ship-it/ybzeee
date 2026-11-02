import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^\d{6}$/;

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(50, 'Name must be under 50 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    phone: z.string().regex(phoneRegex, 'Please enter a valid 10-digit Indian mobile number').optional().or(z.literal('')),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid 10-digit mobile number'),
  street: z.string().min(1, 'Street address is required').min(5, 'Please enter a complete street address'),
  city: z.string().min(1, 'City is required').min(2, 'City name is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(pincodeRegex, 'Please enter a valid 6-digit pincode'),
  country: z.string().min(1, 'Country is required').default('India'),
  isDefault: z.boolean().optional().default(false),
  label: z.string().optional(),
});

export const checkoutSchema = z.object({
  shippingAddress: z.string().min(1, 'Shipping address is required'),
  billingAddress: z.string().optional(),
  sameAsShipping: z.boolean().default(true),
  paymentMethod: z.enum(['cod', 'card', 'upi', 'netbanking', 'wallet'], {
    errorMap: () => ({ message: 'Please select a payment method' }),
  }),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
  saveAddress: z.boolean().default(false),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
  }),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters'),
  body: z.string().min(10, 'Review must be at least 10 characters').max(2000, 'Review must be under 2000 characters'),
});

export const couponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').toUpperCase().trim(),
});

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(50, 'Name must be under 50 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid 10-digit mobile number').optional().or(z.literal('')),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(1, 'New password is required').min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[a-z]/, 'Password must contain at least one lowercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required').min(3, 'Name must be at least 3 characters').max(200, 'Name must be under 200 characters'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(1, 'Description is required').min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be positive').max(999999, 'Price is too high'),
  originalPrice: z.number().positive('Original price must be positive').max(999999, 'Price is too high').optional(),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
  colors: z.array(z.object({ name: z.string(), hex: z.string().regex(/^#/, 'Must be a hex color'), image: z.string() })).min(1, 'At least one color is required'),
  sizes: z.array(z.string()).min(1, 'At least one size is required'),
  fabrics: z.array(z.string()).optional(),
  occasions: z.array(z.string()).optional(),
  inStock: z.boolean().default(true),
  quantity: z.number().int().nonnegative('Quantity cannot be negative').default(0),
  sku: z.string().min(1, 'SKU is required'),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  discount: z.number().min(0).max(100).optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type ProductFormInput = z.infer<typeof productFormSchema>;
