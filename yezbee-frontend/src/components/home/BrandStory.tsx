'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const whyChoosePoints = [
  'Comfortable and stylish maternity wear',
  'Easy-to-wear feeding and nursing kurtis',
  'Fashionable non-feeding and everyday kurtis',
  'Suitable clothing for pregnancy and post-pregnancy',
  'Quality and comfortable fabrics',
  'Trendy and adorable kids wear',
  'Styles designed for comfort without compromising on fashion',
];

export default function BrandStory() {
  return (
    <section className="py-16 sm:py-24 bg-[var(--color-cream)] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:max-w-none overflow-hidden rounded-2xl shadow-soft-xl">
              <Image
                src="/images/hero/hero2.png"
                alt="Yez Bee Fashion Maternity & Feeding Fashion"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-gold-light)] block mb-1">
                  YEZ BEE FASHION
                </span>
                <p className="font-display text-lg sm:text-xl font-semibold italic leading-snug">
                  &ldquo;Comfort, Style &amp; Care for Every Stage of Motherhood.&rdquo;
                </p>
              </div>
            </div>

            <div className="hidden sm:block absolute -bottom-6 -right-4 w-48 h-56 overflow-hidden rounded-xl shadow-gold-lg border-2 border-white">
              <Image
                src="/images/hero/hero1.png"
                alt="Yez Bee Fashion Everyday & Feeding Kurtis"
                fill
                sizes="200px"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2">
              <Sparkles size={15} className="text-[var(--color-primary-gold)]" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-primary-gold)]">
                ABOUT YEZ BEE FASHION
              </span>
            </div>

            <div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-dark)] leading-tight">
                Welcome to Yez Bee Fashion
              </h2>
              <div className="mt-3 h-0.5 w-16 bg-[var(--color-primary-gold)]" />
            </div>

            <div className="space-y-3.5 font-sans text-sm sm:text-base text-[var(--color-dark)]/80 leading-relaxed">
              <p>
                At <strong className="text-[var(--color-dark)] font-semibold">Yez Bee Fashion</strong>, we believe every woman deserves to feel comfortable, confident, and beautiful at every stage of life. We specialize in thoughtfully selected maternity wear, pregnancy wear, feeding kurtis, nursing kurtis, non-feeding kurtis, post-pregnancy wear, comfortable women&apos;s clothing, and kids wear.
              </p>
              <p>
                Our collection is designed to meet the changing needs of women during pregnancy, motherhood, feeding, and beyond. From soft and comfortable maternity outfits to convenient feeding-friendly kurtis and stylish everyday wear, we bring together comfort, quality, fashion, and functionality.
              </p>
              <p>
                We also offer a lovely collection of kids wear, making Yez Bee Fashion a destination for both mothers and little ones.
              </p>
            </div>

            {/* Why Choose Yez Bee Fashion */}
            <div className="pt-2">
              <h3 className="font-display text-lg sm:text-xl font-bold text-[var(--color-dark)] mb-3.5 flex items-center gap-2">
                <HeartHandshake size={18} className="text-[var(--color-primary-gold)]" />
                Why Choose Yez Bee Fashion?
              </h3>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {whyChoosePoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 bg-white/75 backdrop-blur-xs p-2.5 rounded-xl border border-[var(--color-champagne)]/70 shadow-2xs"
                  >
                    <CheckCircle2 size={15} className="text-[var(--color-primary-gold)] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[13px] font-medium text-[var(--color-dark)]/90 leading-snug">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission Card */}
            <div className="p-5 rounded-2xl bg-white border border-[var(--color-primary-gold)]/25 shadow-soft-sm space-y-3">
              <p className="text-xs sm:text-sm text-[var(--color-dark)]/85 leading-relaxed italic">
                &ldquo;At Yez Bee Fashion, our mission is simple: to make motherhood and everyday dressing more comfortable and stylish. Whether you&apos;re an expecting mother, a new mom looking for feeding-friendly clothing, or shopping for your little one, we&apos;re here to help you find something you&apos;ll love.&rdquo;
              </p>
              <div className="pt-2.5 border-t border-[var(--color-champagne)]/70 flex items-center justify-between flex-wrap gap-2">
                <span className="font-display font-bold text-xs sm:text-sm text-[var(--color-primary-gold)]">
                  Yez Bee Fashion – Comfort, Style &amp; Care for Every Stage of Motherhood.
                </span>
                <Link
                  href="/category/casuals"
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] transition-all',
                    'hover:text-[var(--color-primary-gold)] group'
                  )}
                >
                  Shop Collection
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

