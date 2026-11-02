'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  Tag,
  Gift,
  Truck,
  ShieldCheck,
  Lock,
  Sparkles,
  Check,
  ImageIcon,
} from 'lucide-react';
import { useCart } from '@/providers/CartProvider';
import { getSafeImageUrl } from '@/lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalAmount, clearCart, proceedToShopifyCheckout } = useCart();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckoutClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCheckingOut(true);
    try {
      const url = await proceedToShopifyCheckout();
      if (!url) {
        window.location.href = '/checkout';
      }
    } catch {
      window.location.href = '/checkout';
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = totalAmount;
  const discount = couponApplied ? subtotal * 0.15 : 0;
  const freeShippingThreshold = 5000;
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 499;
  const giftWrapFee = giftWrap ? 199 : 0;
  const finalTotal = Math.max(0, subtotal - discount + shipping + giftWrapFee);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.toUpperCase() === 'LUXURY15' || coupon.toUpperCase() === 'YEZ15') {
      setCouponApplied(true);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-[var(--color-champagne)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-primary-gold)]">
                YOUR ATELIER BAG
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-dark)]">
              Shopping Cart
            </h1>
          </div>

          <Link
            href="/category/new-arrivals"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] hover:text-[var(--color-primary-gold)] transition-colors mt-2 md:mt-0"
          >
            <ArrowLeft size={14} /> Continue Exploring Collection
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[var(--color-champagne)] shadow-soft-sm text-center">
            <div className="h-20 w-20 rounded-full bg-[var(--color-champagne)]/40 flex items-center justify-center text-[var(--color-primary-gold)] mb-4">
              <ShoppingBag size={36} />
            </div>
            <h2 className="font-display text-2xl font-bold text-[var(--color-dark)] mb-2">
              Your Bag is Currently Empty
            </h2>
            <p className="text-sm text-[var(--color-dark)]/60 max-w-sm mb-8 font-sans">
              Discover our newest haute couture collections, artisanal lehengas, and statement accessories.
            </p>
            <Link
              href="/category/new-arrivals"
              className="px-8 py-3.5 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:shadow-gold-md transition-all scale-105"
            >
              Shop New Arrivals
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-white p-4 rounded-2xl border border-[var(--color-champagne)]/60 shadow-soft-sm">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-[var(--color-dark)]">
                    {subtotal >= freeShippingThreshold
                      ? '🎉 You have unlocked Free Express Delivery!'
                      : `Add ₹${(freeShippingThreshold - subtotal).toLocaleString()} more for Free Express Shipping`}
                  </span>
                  <span className="text-[var(--color-primary-gold)]">{Math.round(freeShippingProgress)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}-${item.color}`}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 sm:gap-6 p-4 sm:p-5 bg-white rounded-2xl border border-[var(--color-champagne)]/60 shadow-soft-sm items-center"
                    >
                      <div className="relative aspect-[3/4] w-24 sm:w-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        {getSafeImageUrl(item.image) ? (
                          <Image src={getSafeImageUrl(item.image)} alt={item.name} fill sizes="120px" className="object-cover object-center" />
                        ) : (
                          <ImageIcon size={24} className="text-gray-400 opacity-50" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <Link href={`/product/${item.id}`} className="font-display font-bold text-sm sm:text-base text-[var(--color-dark)] hover:text-[var(--color-primary-gold)] transition-colors line-clamp-1">
                              {item.name}
                            </Link>
                            <p className="text-xs text-[var(--color-dark)]/50 font-medium mt-0.5">
                              Color: {item.color} &bull; Size: {item.size}
                            </p>
                          </div>
                          <span className="font-sans text-base font-bold text-[var(--color-dark)]">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2.5 py-1.5 text-gray-600 hover:text-black transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-3 py-1.5 text-xs font-bold min-w-[28px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2.5 py-1.5 text-gray-600 hover:text-black transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-medium">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-[var(--color-soft-red)] transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form onSubmit={applyCoupon} className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-[var(--color-champagne)]">
                  <Tag size={16} className="text-[var(--color-primary-gold)] ml-2" />
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Promo Code (e.g. LUXURY15)"
                    className="flex-1 text-xs outline-none uppercase font-semibold text-[var(--color-dark)]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--color-dark)] text-white text-xs font-bold uppercase rounded-xl hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)] transition-colors"
                  >
                    {couponApplied ? 'Applied' : 'Apply'}
                  </button>
                </form>

                <label className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-[var(--color-champagne)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="rounded text-[var(--color-primary-gold)] focus:ring-[var(--color-primary-gold)]"
                  />
                  <Gift size={16} className="text-[var(--color-primary-gold)]" />
                  <span className="text-xs font-bold text-[var(--color-dark)]">
                    Royal Gift Packaging (+₹199)
                  </span>
                </label>
              </div>
            </div>

            <div className="lg:col-span-4 sticky top-28">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--color-champagne)]/60 shadow-soft-md space-y-4">
                <h3 className="font-display font-bold text-lg text-[var(--color-dark)] pb-3 border-b border-[var(--color-champagne)]">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs font-medium text-[var(--color-dark)]/75">
                  <div className="flex justify-between">
                    <span>Bag Subtotal</span>
                    <span className="font-bold text-[var(--color-dark)]">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-[var(--color-emerald)] font-bold">
                      <span className="flex items-center gap-1"><Check size={12} /> Voucher LUXURY15 (-15%)</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Express Shipping</span>
                    <span>{shipping === 0 ? <strong className="text-[var(--color-emerald)]">FREE</strong> : `₹${shipping}`}</span>
                  </div>

                  {giftWrap && (
                    <div className="flex justify-between">
                      <span>Royal Gift Box</span>
                      <span>₹199</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[var(--color-champagne)]">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="font-display font-bold text-base text-[var(--color-dark)]">Total Amount</span>
                    <span className="font-sans text-2xl font-bold text-[var(--color-dark)]">
                      ₹{Math.round(finalTotal).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckoutClick}
                    disabled={isCheckingOut}
                    className="w-full py-4 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-2 hover:shadow-gold-md transition-all disabled:opacity-75 cursor-pointer"
                  >
                    {isCheckingOut ? 'Connecting to Shopify Checkout...' : 'Proceed to Secure Checkout'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] text-gray-500 border-t border-[var(--color-champagne)]">
                  <div className="flex flex-col items-center">
                    <ShieldCheck size={16} className="text-[var(--color-primary-gold)] mb-1" />
                    <span>Authentic</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Truck size={16} className="text-[var(--color-primary-gold)] mb-1" />
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Lock size={16} className="text-[var(--color-primary-gold)] mb-1" />
                    <span>256-bit SSL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
