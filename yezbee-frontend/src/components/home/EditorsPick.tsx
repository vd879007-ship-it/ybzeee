'use client';

import { ArrowRight, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function EditorsPick() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="relative lg:col-span-8 overflow-hidden rounded-3xl min-h-[480px] lg:min-h-[540px] shadow-soft-lg group">
            <Image
              src="/images/hero/hero1.png"
              alt="Editor's Runway Pick"
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

            <div className="absolute left-6 top-6 z-10">
              <div className="flex items-center gap-2 rounded-full bg-[var(--color-primary-gold)] px-4 py-1.5 shadow-gold-sm">
                <Star size={13} className="fill-[var(--color-dark)] text-[var(--color-dark)]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-dark)]">
                  EDITOR&apos;S RUNWAY CHOICE
                </span>
              </div>
            </div>

            <div className="relative z-10 flex h-full flex-col justify-end p-8 sm:p-12">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[var(--color-gold-light)]" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-gold-light)]">
                  AUTUMN/WINTER HAUTE EDIT
                </span>
              </div>
              <blockquote className="mb-4 max-w-xl font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white">
                &ldquo;Fashion is the armor to survive everyday life with grace and authority.&rdquo;
              </blockquote>
              <p className="mb-6 text-sm text-white/80 font-sans">
                Curated by Chief Fashion Director Vanya Kapoor
              </p>
              <Link
                href="/category/casuals"
                className={cn(
                  'inline-flex w-fit items-center gap-3 rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300',
                  'bg-[var(--color-primary-gold)] text-[var(--color-dark)]',
                  'hover:bg-[var(--color-gold-light)] hover:shadow-gold-md hover:scale-105'
                )}
              >
                Shop The Runway Lookbook
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="group relative flex-1 overflow-hidden rounded-2xl min-h-[250px] shadow-soft-md">
              <Image
                src="/images/hero/hero2.png"
                alt="Royal Festival Edit"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold-light)] mb-1">
                  FEATURED CURATION
                </span>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  Royal Festival Edit
                </h3>
                <Link
                  href="/category/ethnic-wear"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-primary-gold)] hover:text-[var(--color-gold-light)] transition-colors"
                >
                  Explore Edit <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <div className="group relative flex-1 overflow-hidden rounded-2xl min-h-[250px] shadow-soft-md">
              <Image
                src="/images/hero/hero3.png"
                alt="Executive Power Tailoring"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold-light)] mb-1">
                  CAPSULE COLLECTION
                </span>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  Executive Power Tailoring
                </h3>
                <Link
                  href="/category/casuals"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-primary-gold)] hover:text-[var(--color-gold-light)] transition-colors"
                >
                  Explore Capsule <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
