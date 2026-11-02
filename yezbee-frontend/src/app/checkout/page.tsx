'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  ChevronRight,
  ChevronLeft,
  Check,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/providers/CartProvider';
import { useAuth } from '@/providers/AuthProvider';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

type ShippingMethod = 'standard' | 'express' | 'nextday';
type PaymentMethod = 'razorpay' | 'upi' | 'card' | 'cod';
type Step = 'shipping' | 'payment' | 'review';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SHIPPING_OPTIONS = [
  { value: 'standard' as ShippingMethod, label: 'Standard Atelier Delivery', time: '4-6 business days', cost: 0 },
  { value: 'express' as ShippingMethod, label: 'Express Priority Shipping', time: '2-3 business days', cost: 499 },
  { value: 'nextday' as ShippingMethod, label: 'Next-Day White Glove Courier', time: 'Tomorrow guaranteed', cost: 999 },
];

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    firstName: user?.name ? user.name.split(' ')[0] : '',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : '',
    address1: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        firstName: prev.firstName || (user.name ? user.name.split(' ')[0] : ''),
        lastName: prev.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : ''),
      }));
    }
  }, [user]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const subtotal = totalAmount || (items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const shippingCost = SHIPPING_OPTIONS.find((o) => o.value === shippingMethod)?.cost || 0;
  const finalTotal = Math.max(0, subtotal + shippingCost);

  const handlePlaceOrder = async () => {
    if (!form.email || !form.phone || !form.firstName || !form.address1 || !form.pincode) {
      toast.error('Please complete all shipping address fields.');
      setCurrentStep('shipping');
      return;
    }

    setIsSubmitting(true);

    try {
      const lines = items
        .filter((item) => item.variantId)
        .map((item) => ({
          merchandiseId: item.variantId as string,
          quantity: item.quantity,
        }));

      if (lines.length > 0) {
        try {
          const { shopifyCartCreate } = await import('@/lib/shopify');
          const cart = await shopifyCartCreate(lines);
          if (cart?.checkoutUrl) {
            window.location.href = cart.checkoutUrl;
            return;
          }
        } catch (shopifyErr: any) {
          console.warn('[Shopify Checkout] Fallback to local gateway:', shopifyErr.message);
        }
      }
      if (paymentMethod === 'cod') {
        const orderData = {
          items: items.map((i) => ({ product: i.id, quantity: i.quantity, price: i.price })),
          shippingAddress: form,
          paymentMethod: 'COD',
          totalAmount: finalTotal,
        };
        toast.success('Order placed successfully with Cash on Delivery! 📦');
        clearCart();
        router.push('/account');
        return;
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TTw5p1xB5oHjpM';

      const razorpayOrder = await api.createRazorpayOrder({
        amount: finalTotal,
        currency: 'INR',
      });

      if (!window.Razorpay) {
        toast.error('Razorpay SDK failed to load. Please refresh the page.');
        setIsSubmitting(false);
        return;
      }

      const options = {
        key: keyId,
        amount: razorpayOrder.data.amount,
        currency: razorpayOrder.data.currency,
        name: 'YEZ BEE FASHION',
        description: 'Luxury Clothing Purchase',
        image: '/images/yezbee-logo.png',
        order_id: razorpayOrder.data.id,
        handler: async function (response: any) {
          try {
            await api.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            toast.success('Payment Verified! Order Confirmed ✨');
            clearCart();
            router.push('/account');
          } catch (err: any) {
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: '#C9A84C',
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            toast.error('Payment process cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Order creation failed');
      setIsSubmitting(false);
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
                EXPRESS CHECKOUT
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-dark)]">
              Atelier Checkout
            </h1>
          </div>

          <Link href="/cart" className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-gold)] hover:underline mt-2 md:mt-0">
            Back to Bag
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 mb-10 max-w-xl mx-auto">
          {(['shipping', 'payment', 'review'] as Step[]).map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === step
                    ? 'bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] shadow-gold-sm scale-110'
                    : i < ['shipping', 'payment', 'review'].indexOf(currentStep)
                    ? 'bg-[var(--color-emerald)] text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i < ['shipping', 'payment', 'review'].indexOf(currentStep) ? <Check size={16} /> : i + 1}
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider hidden sm:inline ${
                  currentStep === step ? 'text-[var(--color-dark)]' : 'text-gray-400'
                }`}
              >
                {step}
              </span>
              {i < 2 && <div className="w-10 sm:w-16 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {currentStep === 'shipping' && (
                <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-champagne)]/60 shadow-soft-sm space-y-4">
                    <h2 className="font-display text-lg font-bold text-[var(--color-dark)] pb-2 border-b border-[var(--color-champagne)]">
                      1. Contact Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-[var(--color-dark)]/60 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder="name@example.com"
                          className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary-gold)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-[var(--color-dark)]/60 mb-1">Mobile Phone *</label>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary-gold)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-champagne)]/60 shadow-soft-sm space-y-4">
                    <h2 className="font-display text-lg font-bold text-[var(--color-dark)] pb-2 border-b border-[var(--color-champagne)]">
                      2. Shipping Address
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-[var(--color-dark)]/60 mb-1">First Name *</label>
                        <input type="text" required value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="Priya" className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary-gold)]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-[var(--color-dark)]/60 mb-1">Last Name</label>
                        <input type="text" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="Sharma" className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary-gold)]" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase text-[var(--color-dark)]/60 mb-1">Street Address *</label>
                        <input type="text" required value={form.address1} onChange={(e) => updateField('address1', e.target.value)} placeholder="House No, Apartment, Street" className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary-gold)]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-[var(--color-dark)]/60 mb-1">City *</label>
                        <input type="text" required value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Chennai" className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary-gold)]" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-[var(--color-dark)]/60 mb-1">Pincode *</label>
                        <input type="text" required value={form.pincode} onChange={(e) => updateField('pincode', e.target.value)} placeholder="600001" className="w-full text-xs font-semibold p-3 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary-gold)]" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-champagne)]/60 shadow-soft-sm space-y-4">
                    <h2 className="font-display text-lg font-bold text-[var(--color-dark)] pb-2 border-b border-[var(--color-champagne)]">
                      3. Shipping Method
                    </h2>
                    <div className="space-y-3">
                      {SHIPPING_OPTIONS.map((opt) => (
                        <label
                          key={opt.value}
                          onClick={() => setShippingMethod(opt.value)}
                          className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                            shippingMethod === opt.value
                              ? 'border-[var(--color-primary-gold)] bg-[var(--color-champagne)]/20 shadow-gold-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input type="radio" checked={shippingMethod === opt.value} readOnly className="text-[var(--color-primary-gold)] focus:ring-[var(--color-primary-gold)]" />
                            <div>
                              <p className="text-xs font-bold text-[var(--color-dark)]">{opt.label}</p>
                              <p className="text-[11px] text-gray-500">{opt.time}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[var(--color-dark)]">{opt.cost === 0 ? 'FREE' : `₹${opt.cost}`}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!form.email || !form.phone || !form.firstName || !form.address1 || !form.pincode) {
                        toast.error('Please fill in all required shipping details');
                        return;
                      }
                      setCurrentStep('payment');
                    }}
                    className="w-full py-4 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-2 hover:shadow-gold-md transition-all"
                  >
                    Continue to Payment Options <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}

              {currentStep === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-champagne)]/60 shadow-soft-sm space-y-4">
                    <h2 className="font-display text-lg font-bold text-[var(--color-dark)] pb-2 border-b border-[var(--color-champagne)]">
                      Select Payment Method
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {([
                        { id: 'razorpay', label: 'Razorpay (UPI / GPay / Cards / NetBanking)', icon: ShieldCheck, desc: 'Instant & Secure Gateway' },
                        { id: 'cod', label: 'Cash on Delivery (COD)', icon: Banknote, desc: 'Pay when delivered' },
                      ]).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                          className={`p-5 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                            paymentMethod === m.id
                              ? 'border-[var(--color-primary-gold)] bg-[var(--color-champagne)]/20 shadow-gold-sm'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <m.icon size={22} className={paymentMethod === m.id ? 'text-[var(--color-primary-gold)]' : 'text-gray-400'} />
                            <span className="text-xs font-bold text-[var(--color-dark)]">{m.label}</span>
                          </div>
                          <span className="text-[11px] text-gray-500 pl-8">{m.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setCurrentStep('shipping')} className="py-4 px-6 rounded-xl border border-gray-200 text-xs font-bold uppercase text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button onClick={() => setCurrentStep('review')} className="flex-1 py-4 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-2 hover:shadow-gold-md transition-all">
                      Review & Pay <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'review' && (
                <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-champagne)]/60 shadow-soft-sm space-y-4">
                    <h2 className="font-display text-lg font-bold text-[var(--color-dark)] pb-2 border-b border-[var(--color-champagne)]">
                      Review Order & Confirmation
                    </h2>
                    <div className="text-xs space-y-2 text-gray-600">
                      <p><strong>Deliver To:</strong> {form.firstName} {form.lastName}, {form.address1}, {form.city} - {form.pincode}</p>
                      <p><strong>Contact:</strong> {form.email} &bull; {form.phone}</p>
                      <p><strong>Payment Method:</strong> {paymentMethod === 'razorpay' ? 'Razorpay Secure Payment (UPI/Cards/NetBanking)' : 'Cash on Delivery (COD)'}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setCurrentStep('payment')} className="py-4 px-6 rounded-xl border border-gray-200 text-xs font-bold uppercase text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="flex-1 py-4 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-2 hover:shadow-gold-md transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-[var(--color-dark)] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        `Pay & Place Order (₹${Math.round(finalTotal).toLocaleString()})`
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--color-champagne)]/60 shadow-soft-md space-y-4">
              <h3 className="font-display font-bold text-lg text-[var(--color-dark)] pb-3 border-b border-[var(--color-champagne)]">
                Items Summary
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">Your bag is empty.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="relative aspect-[3/4] w-12 rounded-lg overflow-hidden bg-[#F7F4EE] flex-shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill sizes="60px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-[8px] font-bold uppercase">
                            YEZ BEE
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[var(--color-dark)] line-clamp-1">{item.name}</p>
                        <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-[var(--color-dark)]">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-[var(--color-champagne)] space-y-2 text-xs font-semibold text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-black">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? <strong className="text-[var(--color-emerald)]">FREE</strong> : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-black pt-2 border-t">
                  <span>Total Due</span>
                  <span className="text-[var(--color-primary-gold)]">₹{Math.round(finalTotal).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-gray-400 flex items-center justify-center gap-2">
                <Lock size={12} className="text-[var(--color-primary-gold)]" /> 256-bit Encrypted SSL Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
