'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TRENDS = [
  {
    id: 1,
    title: 'Peplum Tops & Waist Tunics',
    description: 'Sculpted silhouettes redefining modern casual glam with all-day comfort',
    slug: '/category/peplum-tops',
    image: '/images/hero/hero1.png',
  },
  {
    id: 2,
    title: 'Casuals & Feeding Edit',
    description: 'Effortlessly fluid pure cotton ensembles with hidden nursing zips',
    slug: '/category/casuals/feeding',
    image: '/images/hero/hero2.png',
  },
  {
    id: 3,
    title: 'Party Wear & Festive Gowns',
    description: 'Festive grace and gold embellishments designed for celebrations',
    slug: '/category/party-wear',
    image: '/images/hero/hero3.png',
  },
];

export default function TrendingSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-gold)]">
              SEASONAL TREND RADAR
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold text-[var(--color-dark)] sm:text-4xl lg:text-5xl">
            Trending Now
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-16 bg-[var(--color-primary-gold)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TRENDS.map((trend) => (
            <Link
              key={trend.id}
              href={trend.slug}
              className={cn(
                'group relative flex h-[380px] sm:h-[440px] lg:h-[480px] w-full flex-col justify-end overflow-hidden rounded-2xl sm:rounded-3xl',
                'shadow-soft-lg hover:shadow-gold-md transition-all duration-500 hover:-translate-y-1'
              )}
            >
              <Image
                src={trend.image}
                alt={trend.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              <div className="relative z-10 p-6 sm:p-8 text-white">
                <span className="mb-2 inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-gold-light)]">
                  TREND REPORT
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-1.5">
                  {trend.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/75 line-clamp-2 mb-3">
                  {trend.description}
                </p>
                <span
                  className={cn(
                    'inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] transition-transform duration-300',
                    'text-[var(--color-primary-gold)] group-hover:translate-x-1 font-semibold'
                  )}
                >
                  Shop The Trend <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
