'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface OrderTimelineStage {
  label: string;
  key: string;
  description: string;
}

const STAGES: OrderTimelineStage[] = [
  { label: 'ORDER PLACED', key: 'placed', description: 'Order received at atelier' },
  { label: 'CONFIRMED', key: 'confirmed', description: 'Payment verified & order approved' },
  { label: 'PACKED', key: 'packed', description: 'Bespoke packaging & quality checked' },
  { label: 'SHIPPED', key: 'shipped', description: 'Handed over to BlueDart Courier' },
  { label: 'OUT FOR DELIVERY', key: 'out_for_delivery', description: 'Agent out for doorstep delivery' },
  { label: 'DELIVERED', key: 'delivered', description: 'Package delivered safely' },
];

const MOCK_ORDER = {
  orderNumber: 'YEZ12345',
  date: 'August 01, 2026',
  expectedDelivery: 'August 05, 2026',
  currentStageIndex: 3,
  courier: 'BlueDart Express',
  trackingNumber: 'BD-987654321IN',
  status: 'In Transit - On schedule for doorstep delivery',
  item: {
    name: 'Cotton Casual Feeding Kurti',
    size: 'M',
    color: 'Peach Floral',
    quantity: 1,
    price: 1899,
    image: '/images/categories/maternity-kurtis.jpg',
  },
  shippingAddress: {
    name: 'Priya Sharma',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  },
  paymentStatus: 'Paid via UPI (Razorpay)',
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<typeof MOCK_ORDER | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !contactInfo.trim()) {
      setErrorMsg('Please enter both Order ID and Phone / Email');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSearched(true);
      const normalizedInput = orderId.trim().toUpperCase();
      if (normalizedInput.includes('123') || normalizedInput.includes('YEZ') || normalizedInput.length >= 4) {
        setFoundOrder(MOCK_ORDER);
      } else {
        setFoundOrder(null);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-[var(--color-dark)]/50 font-medium" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[var(--color-primary-gold)] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[var(--color-dark)] font-bold">Track Your Order</span>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-champagne)]/60 text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider mb-4 border border-[var(--color-primary-gold)]/30">
          <Package size={14} className="text-[var(--color-primary-gold)]" /> Real-Time Parcel Tracking
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[var(--color-dark)] mb-3">
          Track Your Order
        </h1>

        <p className="text-gray-600 text-sm sm:text-base max-w-lg mx-auto mb-8 font-sans">
          Enter your Order ID and Phone Number or Email below to view real-time delivery status, tracking number, and courier timeline.
        </p>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-champagne)]/80 shadow-soft-md text-left">
          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="order-id-input" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] mb-2">
                  Order ID *
                </label>
                <input
                  id="order-id-input"
                  type="text"
                  placeholder="e.g. YEZ12345"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-gray-200 outline-none focus:border-[var(--color-primary-gold)] bg-gray-50/50"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-info-input" className="block text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] mb-2">
                  Phone Number or Email *
                </label>
                <input
                  id="contact-info-input"
                  type="text"
                  placeholder="e.g. 9876543210 or email@domain.com"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-gray-200 outline-none focus:border-[var(--color-primary-gold)] bg-gray-50/50"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-[var(--color-soft-red)] flex items-center gap-1.5">
                <AlertCircle size={14} /> {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[var(--color-dark)] text-white text-xs font-bold uppercase tracking-[0.18em] rounded-xl hover:bg-[var(--color-darker)] hover:shadow-dark-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={16} /> Track Order Status
                </>
              )}
            </button>
          </form>

          <p className="mt-3 text-[11px] text-gray-400 text-center">
            Tip: Try entering Order ID <span className="font-bold text-[var(--color-primary-gold)]">YEZ12345</span> to preview tracking timeline.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
          >
            {foundOrder ? (
              <div className="bg-white rounded-3xl border border-[var(--color-champagne)] p-6 sm:p-10 shadow-soft-lg space-y-8">

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[var(--color-champagne)] gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-gold)]">
                        Order #{foundOrder.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ON SCHEDULE
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-[var(--color-dark)]">
                      Expected Delivery: {foundOrder.expectedDelivery}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right text-xs text-gray-500">
                    <p className="font-semibold text-black">Courier: {foundOrder.courier}</p>
                    <p>AWB Tracking: <span className="font-mono font-bold text-[var(--color-dark)]">{foundOrder.trackingNumber}</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--color-dark)] mb-6">
                    Live Delivery Timeline
                  </h3>

                  <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
                    <div className="hidden md:block absolute top-5 left-6 right-6 h-0.5 bg-gray-200 z-0" />
                    <div
                      className="hidden md:block absolute top-5 left-6 h-0.5 bg-[var(--color-primary-gold)] z-0 transition-all duration-500"
                      style={{ width: `${(foundOrder.currentStageIndex / (STAGES.length - 1)) * 100}%` }}
                    />

                    {STAGES.map((stage, index) => {
                      const isCompleted = index <= foundOrder.currentStageIndex;
                      const isCurrent = index === foundOrder.currentStageIndex;

                      return (
                        <div key={stage.key} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isCurrent
                                ? 'bg-[var(--color-dark)] text-white ring-4 ring-[var(--color-primary-gold)]/50 scale-110 shadow-gold-sm'
                                : isCompleted
                                ? 'bg-[var(--color-primary-gold)] text-[var(--color-dark)]'
                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 size={18} /> : index + 1}
                          </div>

                          <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-[var(--color-dark)]' : 'text-gray-400'}`}>
                              {stage.label}
                            </p>
                            <p className="text-[10px] text-gray-500 max-w-[120px]">
                              {stage.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[var(--color-warm-white)] p-6 rounded-2xl border border-[var(--color-champagne)]/60 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 flex gap-4 items-center">
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-white border shrink-0">
                      <Image src={foundOrder.item.image} alt={foundOrder.item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-[var(--color-dark)]">{foundOrder.item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Size: <span className="font-bold text-black">{foundOrder.item.size}</span> · Color: <span className="font-bold text-black">{foundOrder.item.color}</span></p>
                      <p className="text-xs text-gray-500">Qty: {foundOrder.item.quantity} · Price: <span className="font-bold text-black">₹{foundOrder.item.price.toLocaleString('en-IN')}</span></p>
                      <p className="text-[11px] text-emerald-700 font-semibold mt-1">{foundOrder.paymentStatus}</p>
                    </div>
                  </div>

                  <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 text-xs space-y-1">
                    <p className="font-bold uppercase tracking-wider text-gray-400">Shipping To:</p>
                    <p className="font-bold text-black">{foundOrder.shippingAddress.name}</p>
                    <p className="text-gray-600">{foundOrder.shippingAddress.city}, {foundOrder.shippingAddress.state} - {foundOrder.shippingAddress.pincode}</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[var(--color-champagne)] p-8 text-center space-y-4">
                <AlertCircle size={48} className="mx-auto text-[var(--color-soft-red)]" />
                <h3 className="font-display text-2xl font-bold text-[var(--color-dark)]">Order Not Found</h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                  We couldn&apos;t find an active order matching ID <span className="font-mono font-bold text-black">{orderId}</span> and contact <span className="font-bold text-black">{contactInfo}</span>. Please verify your order receipt.
                </p>

                <div className="pt-4 flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={() => { setSearched(false); setOrderId(''); setContactInfo(''); }}
                    className="px-6 py-2.5 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-wider hover:border-black"
                  >
                    Try Again
                  </button>
                  <Link
                    href="/contact"
                    className="px-6 py-2.5 bg-[var(--color-primary-gold)] text-[var(--color-dark)] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-gold-light)] flex items-center gap-1.5"
                  >
                    <HelpCircle size={14} /> Contact Support
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
