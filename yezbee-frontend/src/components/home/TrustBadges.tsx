'use client';

import { ShieldCheck, Truck, RotateCcw, Headphones, Lock, Award } from 'lucide-react';

const BADGES = [
  {
    icon: ShieldCheck,
    title: '100% Authentic Haute Couture',
    desc: 'Certified genuine silk & hand-crafted garments',
  },
  {
    icon: Truck,
    title: 'Free Worldwide Express Shipping',
    desc: 'Complimentary white-glove delivery on ₹5,000+',
  },
  {
    icon: RotateCcw,
    title: 'Instant 7-Day Returns',
    desc: 'Hassle-free doorstep pickup & quick refund',
  },
  {
    icon: Headphones,
    title: '24/7 Personal Fashion Concierge',
    desc: 'Dedicated styling advice & custom sizing',
  },
  {
    icon: Lock,
    title: '256-Bit SSL Encrypted',
    desc: 'Bank-grade security & safe transactions',
  },
  {
    icon: Award,
    title: 'Master Craftsmanship',
    desc: 'Handcrafted by 500+ heritage Indian artisans',
  },
];

export default function TrustBadges() {
  return (
    <section className="w-full bg-[var(--color-darker)] border-t border-[var(--color-champagne)]/20 py-16 md:py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {BADGES.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div key={index} className="group text-center flex flex-col items-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-gold)]/10 transition-all duration-300 group-hover:bg-[var(--color-primary-gold)] group-hover:text-[var(--color-dark)] text-[var(--color-primary-gold)] border border-[var(--color-primary-gold)]/30">
                  <Icon size={24} />
                </div>
                <h3 className="font-display text-sm font-bold text-white mb-1">
                  {badge.title}
                </h3>
                <p className="font-sans text-[11px] leading-relaxed text-white/60">
                  {badge.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
