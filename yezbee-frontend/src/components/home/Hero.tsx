'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const slides = [
  {
    id: 1,
    eyebrow: 'MATERNITY & FEEDING WEAR',
    heading: 'Yezbee Fashion - Best Maternity Kurtis for Women',
    description: 'Shop the best maternity kurtis and kurti sets for women online. Enjoy stylish, comfortable, and pregnancy-friendly designs perfect for every occasion.',
    mobileDescription: 'Shop stylish, comfortable & pregnancy-friendly maternity kurtis online.',
    primaryCta: 'SHOP MATERNITY KURTIS',
    primaryHref: '/category/ethnic-wear',
    secondaryCta: 'EXPLORE ALL KURTIS',
    secondaryHref: '/category/casuals',
    image: '/images/hero/hero1.png',
    alt: 'Best maternity kurtis and kurti sets for women online - YEZ BEE',
    align: 'left',
    imagePosition: 'object-[80%_center]',
    bg: '#E2D7CB',
  },
  {
    id: 2,
    eyebrow: 'CASUALS & FEEDING',
    heading: 'Comfort That Moves With You',
    description: 'Breezy pure cotton kurtis, printed feeding dresses, and everyday styles designed for effortless comfort.',
    mobileDescription: 'Breezy cotton kurtis and printed feeding dresses.',
    primaryCta: 'SHOP CASUALS',
    primaryHref: '/category/casuals',
    secondaryCta: 'SHOP FEEDING WEAR',
    secondaryHref: '/category/casuals/feeding',
    image: '/images/hero/hero3.png',
    alt: 'Woman in stylish YEZ BEE printed casual feeding dress',
    align: 'left',
    imagePosition: 'object-[80%_center]',
    bg: '#FAF7F2',
  },
  {
    id: 3,
    eyebrow: 'SIGNATURE PEPLUM TOPS',
    heading: 'Modern Silhouettes, Everyday Luxury',
    description: 'Discover flattering peplum tops, chic tunics, and versatile dresses tailored for modern style and feeding ease.',
    mobileDescription: 'Flattering peplum tops and versatile feeding tunics.',
    primaryCta: 'EXPLORE PEPLUM TOPS',
    primaryHref: '/category/peplum-tops',
    secondaryCta: 'PARTY WEAR',
    secondaryHref: '/category/party-wear',
    image: '/images/hero/hero2.png',
    alt: 'Stylish woman wearing modern YEZ BEE patterned festive outfit',
    align: 'right',
    imagePosition: 'object-[20%_center]',
    bg: '#201914',
  },
  {
    id: 4,
    eyebrow: 'LOUNGE WEAR & NIGHT SUITS',
    heading: 'Made For Your Everyday Relaxation',
    description: 'Ultra-soft pure cotton loungewear, cozy night suits, and relaxed feeding lounge sets for ultimate comfort at home.',
    mobileDescription: 'Soft pure cotton loungewear and feeding night suits.',
    primaryCta: 'SHOP LOUNGE WEAR',
    primaryHref: '/category/lounge-wear',
    secondaryCta: 'NEW ARRIVALS',
    secondaryHref: '/category/casuals',
    image: '/images/hero/hero4.png',
    alt: 'Woman wearing comfortable YEZ BEE lounge dress',
    align: 'right',
    imagePosition: 'object-[20%_center]',
    bg: '#F5F5F7',
  },
];

const textVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  const slide = slides[currentSlide];

  return (
    <section
      className="relative w-full h-[480px] sm:h-[540px] md:h-[580px] lg:h-[620px] overflow-hidden bg-black text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Maternity Dress Campaign"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 z-0"
          style={{ backgroundColor: slide.bg }}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority
            loading="eager"
            sizes="100vw"
            className={cn('object-cover transition-transform duration-1000', slide.imagePosition)}
          />

          <div
            className={cn(
              'absolute inset-0 z-10 pointer-events-none',
              slide.align === 'left'
                ? 'bg-gradient-to-r from-black/90 via-black/50 via-40% to-transparent'
                : 'bg-gradient-to-l from-black/90 via-black/50 via-40% to-transparent'
            )}
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent sm:hidden pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center py-6 sm:py-8 md:py-10">
          <div
            className={cn(
              'w-full max-w-md sm:max-w-lg lg:max-w-xl z-20',
              slide.align === 'right'
                ? 'ml-auto text-left pr-2 sm:pr-4'
                : 'text-left pl-2 sm:pl-4 md:pl-6 lg:pl-8'
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col items-start"
              >
                <motion.div custom={0} variants={textVariants} className="inline-flex items-center gap-2.5 mb-2.5 sm:mb-3">
                  <Sparkles size={16} className="text-[var(--color-primary-gold)]" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.26em] text-[var(--color-gold-light)]">
                    {slide.eyebrow}
                  </span>
                </motion.div>

                <motion.h1
                  custom={1}
                  variants={textVariants}
                  className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.14] mb-3 sm:mb-4 drop-shadow-md"
                >
                  {slide.heading}
                </motion.h1>

                <motion.p
                  custom={2}
                  variants={textVariants}
                  className="text-sm sm:text-base lg:text-lg text-white/90 font-sans leading-relaxed mb-6 sm:mb-8 max-w-xl drop-shadow-sm"
                >
                  <span className="hidden sm:inline">{slide.description}</span>
                  <span className="sm:hidden">{slide.mobileDescription}</span>
                </motion.p>

                <motion.div custom={3} variants={textVariants} className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <Link
                    href={slide.primaryHref}
                    className={cn(
                      'group inline-flex items-center gap-2.5 rounded-full px-7 sm:px-9 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-all duration-300 min-h-[46px] sm:min-h-[50px]',
                      'bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)]',
                      'hover:shadow-gold-md hover:scale-105 active:scale-95'
                    )}
                  >
                    {slide.primaryCta}
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>

                  {slide.secondaryCta && (
                    <Link
                      href={slide.secondaryHref!}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-all duration-300 min-h-[46px] sm:min-h-[50px]',
                        'border border-white/50 text-white backdrop-blur-sm',
                        'hover:bg-white hover:text-[var(--color-dark)] hover:border-white'
                      )}
                    >
                      {slide.secondaryCta}
                    </Link>
                  )}
                </motion.div>

                <motion.div custom={4} variants={textVariants} className="mt-6 sm:mt-8 pt-4 border-t border-white/20 flex items-center gap-2 text-xs sm:text-sm text-white/80 font-medium">
                  <HeartHandshake size={16} className="text-[var(--color-primary-gold)] shrink-0" />
                  <span>Comfort-first silhouettes • Easy movement • Thoughtful fits</span>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={prevSlide}
        suppressHydrationWarning
        className="absolute left-2.5 sm:left-5 top-1/2 z-20 -translate-y-1/2 rounded-full p-2 sm:p-2.5 text-white/80 bg-black/30 backdrop-blur-md transition-all duration-300 hover:bg-white/25 hover:text-white cursor-pointer"
        aria-label="Previous maternity slide"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        suppressHydrationWarning
        className="absolute right-2.5 sm:right-5 top-1/2 z-20 -translate-y-1/2 rounded-full p-2 sm:p-2.5 text-white/80 bg-black/30 backdrop-blur-md transition-all duration-300 hover:bg-white/25 hover:text-white cursor-pointer"
        aria-label="Next maternity slide"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-8 z-20 flex items-center gap-3">
        <span className="font-mono text-[11px] sm:text-xs font-bold text-white/80 tracking-wider">
          0{currentSlide + 1} <span className="text-white/40">/</span> 0{slides.length}
        </span>
        <div className="flex items-center gap-1.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              suppressHydrationWarning
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                currentSlide === idx
                  ? 'w-5 bg-[var(--color-primary-gold)]'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              )}
              aria-label={`Go to slide ${idx + 1}`}
              aria-pressed={currentSlide === idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
