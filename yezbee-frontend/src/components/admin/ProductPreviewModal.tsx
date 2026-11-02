'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Heart,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Eye,
} from 'lucide-react';
import { getSafeImageUrl } from '@/lib/utils';

export interface ProductPreviewData {
  name: string;
  categoryName: string;
  price: number;
  compareAtPrice?: number | null;
  discount?: number;
  images: Array<{ url: string; alt?: string; color?: string }>;
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
  description: string;
  shortDescription?: string;
  highlights?: string[];
  fabric?: string;
  fit?: string;
  pattern?: string;
  occasion?: string;
  careInstructions?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  totalStock: number;
}

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductPreviewData;
}

export default function ProductPreviewModal({
  isOpen,
  onClose,
  product,
}: ProductPreviewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');

  if (!isOpen) return null;

  const displayImages = (product.images || []).filter((i) => i && i.url && i.url.trim());
  const currentImage = displayImages[selectedImageIndex] || displayImages[0];
  const calcDiscount = product.discount || (
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-5xl bg-[#FAF7F2] rounded-3xl border border-[var(--color-primary-gold)]/30 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col font-sans"
        >
          <div className="bg-[var(--color-dark)] text-white px-6 py-3 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-[var(--color-primary-gold)]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-gold-light)]">
                CUSTOMER STOREFRONT PREVIEW
              </span>
              <span
                className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  product.status === 'PUBLISHED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {product.status === 'PUBLISHED' ? 'LIVE PUBLISHED MODE' : 'DRAFT MODE (Hidden from Customers)'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-white shadow-soft-md border border-[var(--color-champagne)]/60 flex items-center justify-center">
                {currentImage?.url ? (
                  <Image
                    src={getSafeImageUrl(currentImage.url)}
                    alt={currentImage.alt || product.name}
                    fill
                    className="object-cover object-center"
                    unoptimized={currentImage.url.startsWith('blob:') || currentImage.url.startsWith('data:')}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-2 p-6 text-center">
                    <span className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">
                      [IMG]
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">No Image Uploaded</span>
                  </div>
                )}

                {calcDiscount > 0 && (
                  <span className="absolute top-4 left-4 bg-[var(--color-soft-red)] text-white text-xs font-bold uppercase px-3 py-1 rounded-md shadow-sm">
                    -{calcDiscount}% OFF
                  </span>
                )}

                <button
                  type="button"
                  className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[var(--color-dark)] shadow-sm hover:bg-[var(--color-primary-gold)] transition-colors"
                >
                  <Heart size={18} />
                </button>
              </div>

              {displayImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {displayImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative aspect-[3/4] w-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-[var(--color-primary-gold)] ring-2 ring-[var(--color-primary-gold)]/30 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={getSafeImageUrl(img.url)}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={img.url.startsWith('blob:') || img.url.startsWith('data:')}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs text-[var(--color-dark)]/50 font-bold uppercase tracking-wider mb-2">
                  <span>{product.categoryName}</span>
                  {product.totalStock > 0 ? (
                    <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      In Stock ({product.totalStock} units available)
                    </span>
                  ) : (
                    <span className="text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-dark)] leading-tight mb-3">
                  {product.name}
                </h1>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center text-[var(--color-primary-gold)]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} className="fill-[var(--color-primary-gold)]" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-dark)]/70">
                    4.9 (42 verified reviews)
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-6 p-4 rounded-2xl bg-white border border-[var(--color-champagne)]/60">
                  <span className="font-sans text-2xl sm:text-3xl font-bold text-[var(--color-dark)]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-base text-[var(--color-dark)]/40 line-through">
                      ₹{product.compareAtPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {calcDiscount > 0 && (
                    <span className="text-xs font-bold text-[var(--color-soft-red)] bg-rose-50 px-2.5 py-1 rounded-md">
                      Save ₹{(product.compareAtPrice! - product.price).toLocaleString('en-IN')} ({calcDiscount}%)
                    </span>
                  )}
                </div>

                {product.colors.length > 0 && (
                  <div className="mb-6">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]/70 block mb-2">
                      Color: <span className="text-[var(--color-dark)] font-bold">{product.colors[selectedColorIndex]?.name}</span>
                    </label>
                    <div className="flex items-center gap-2.5">
                      {product.colors.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedColorIndex(i)}
                          className={`h-7 w-7 rounded-full border border-gray-300 transition-all flex items-center justify-center ${
                            selectedColorIndex === i
                              ? 'ring-2 ring-[var(--color-primary-gold)] ring-offset-2 scale-110'
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-dark)]/70">
                        Select Size
                      </label>
                      <span className="text-xs text-[var(--color-primary-gold)] font-bold cursor-pointer hover:underline">
                        Size Guide
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`min-w-[44px] h-10 px-3.5 rounded-xl text-xs font-bold transition-all ${
                            selectedSize === sz
                              ? 'bg-[var(--color-dark)] text-white shadow-md'
                              : 'bg-white text-[var(--color-dark)] border border-gray-200 hover:border-black'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mb-6">
                  <button
                    disabled
                    className="flex-1 py-4 px-6 rounded-full bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-[0.2em] shadow-gold-md flex items-center justify-center gap-2 opacity-90 cursor-not-allowed"
                  >
                    <ShoppingBag size={16} /> Add to Bag (Preview Mode)
                  </button>
                </div>

                {product.shortDescription && (
                  <p className="text-xs text-[var(--color-dark)]/80 leading-relaxed font-medium mb-4">
                    {product.shortDescription}
                  </p>
                )}

                {product.highlights && product.highlights.length > 0 && (
                  <div className="p-4 bg-white rounded-2xl border border-[var(--color-champagne)]/60 space-y-2 mb-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-gold)] uppercase tracking-wider">
                      <Sparkles size={14} /> Product Highlights
                    </div>
                    <ul className="space-y-1 text-xs text-[var(--color-dark)]/80">
                      {product.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check size={12} className="text-[var(--color-emerald)] shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--color-champagne)] text-center text-[10px] font-bold text-[var(--color-dark)]/70">
                <div className="flex flex-col items-center gap-1">
                  <Truck size={16} className="text-[var(--color-primary-gold)]" />
                  <span>Free Express Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw size={16} className="text-[var(--color-primary-gold)]" />
                  <span>7-Day Easy Returns</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck size={16} className="text-[var(--color-primary-gold)]" />
                  <span>100% Authentic YEZ BEE</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
