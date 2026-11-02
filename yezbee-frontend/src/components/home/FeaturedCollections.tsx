'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { YEZBEE_CATEGORIES } from '@/data/categories';

export default function FeaturedCollections() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-primary-gold)]">
              EXPLORE OUR CATALOG
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold text-[var(--color-dark)] sm:text-4xl lg:text-5xl">
            Featured Product Categories
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-16 bg-[var(--color-primary-gold)]" />
          <p className="mt-4 text-sm text-[var(--color-dark)]/60 sm:text-base">
            Thoughtfully crafted maternity wear, nursing loungewear, kids clothing, and everyday comfort fashion
          </p>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {YEZBEE_CATEGORIES.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
              className="relative group overflow-hidden rounded-2xl shadow-soft-sm h-[320px] sm:h-[360px]"
            >
              <Link href={col.path} className="relative block h-full w-full">
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-500 group-hover:from-black/90" />

                <div className="absolute inset-0 p-6 sm:p-7 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-gold-light)] mb-1">
                    {col.itemCount}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white mb-1 group-hover:text-[var(--color-gold-light)] transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-white/75 mb-4 line-clamp-2 leading-relaxed">
                    {col.description}
                  </p>

                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-primary-gold)] group-hover:translate-x-1 transition-transform">
                    Shop {col.name} <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
