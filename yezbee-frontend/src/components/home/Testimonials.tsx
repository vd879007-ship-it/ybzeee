'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TESTIMONIALS_DATA = [
  {
    id: 1,
    name: 'Princess Gayatri Devi R.',
    role: 'Verified Patron • Mumbai',
    product: 'Embroidered Royal Zardozi Lehenga Set',
    rating: 5,
    text: 'The craftsmanship of the Zardozi embroidery is reminiscent of royal heritage ateliers. The fit was absolutely tailor-made and the fabric drape feels extraordinarily opulent.',
  },
  {
    id: 2,
    name: 'Natasha Poonawalla',
    role: 'Verified Patron • New Delhi',
    product: 'Midnight Sequin Evening Gown',
    rating: 5,
    text: 'Wore YEZ BEE to the Met Gala Afterparty and received countless compliments. The structural boning and satin lining demonstrate world-class haute couture quality.',
  },
  {
    id: 3,
    name: 'Radhika Merchant',
    role: 'Verified Patron • Mumbai',
    product: 'Hand-woven Pure Silk Banarasi Saree',
    rating: 5,
    text: 'The weight of pure silk combined with genuine silver-gold zari weave makes this a heirloom piece. YEZ BEE has set a new gold standard in luxury fashion.',
  },
  {
    id: 4,
    name: 'Sunaina Singhania',
    role: 'Verified Patron • Bengaluru',
    product: 'Bespoke Satin Blazer & Trouser Set',
    rating: 5,
    text: 'Flawless precision tailoring for board meetings and evening galas alike. The customer concierge went above and beyond to personalize my sleeve length.',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
  const prev = () => setCurrent((prev) => (prev - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length);

  return (
    <section className="py-20 sm:py-28 bg-[var(--color-warm-white)] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-gold)]">
              PATRON TESTIMONIALS
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold text-[var(--color-dark)] sm:text-4xl lg:text-5xl">
            Words of Appreciation
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-16 bg-[var(--color-primary-gold)]" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={TESTIMONIALS_DATA[current].id}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-white p-8 sm:p-12 rounded-3xl border border-[var(--color-champagne)]/60 shadow-soft-xl relative text-center flex flex-col items-center"
            >
              <Quote size={48} className="text-[var(--color-primary-gold)]/20 mb-4" />

              <div className="flex items-center gap-1 text-[var(--color-primary-gold)] mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} className="fill-[var(--color-primary-gold)]" />
                ))}
              </div>

              <p className="font-display text-xl sm:text-2xl text-[var(--color-dark)] leading-relaxed italic mb-8 max-w-2xl">
                &ldquo;{TESTIMONIALS_DATA[current].text}&rdquo;
              </p>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-sans text-base font-bold text-[var(--color-dark)]">
                    {TESTIMONIALS_DATA[current].name}
                  </h3>
                  <CheckCircle size={14} className="text-[var(--color-emerald)] fill-[var(--color-emerald)]/10" />
                </div>
                <span className="text-xs text-[var(--color-dark)]/50 font-medium tracking-wider mb-2">
                  {TESTIMONIALS_DATA[current].role}
                </span>
                <span className="text-[11px] font-semibold text-[var(--color-primary-gold)] bg-[var(--color-champagne)]/40 px-3 py-1 rounded-full border border-[var(--color-primary-gold)]/20">
                  Purchased: {TESTIMONIALS_DATA[current].product}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prev}
              suppressHydrationWarning
              className="h-11 w-11 rounded-full border border-[var(--color-dark)]/20 flex items-center justify-center text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-white transition-all shadow-sm"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-2">
              {TESTIMONIALS_DATA.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  suppressHydrationWarning
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    index === current ? 'w-8 bg-[var(--color-primary-gold)]' : 'w-2 bg-gray-300'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              suppressHydrationWarning
              className="h-11 w-11 rounded-full border border-[var(--color-dark)]/20 flex items-center justify-center text-[var(--color-dark)] hover:bg-[var(--color-dark)] hover:text-white transition-all shadow-sm"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
