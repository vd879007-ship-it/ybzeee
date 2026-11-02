'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Sparkles, Tag, Package, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const CATEGORY_COLUMNS = [
  {
    title: 'CASUALS & PARTY WEAR',
    links: [
      { label: 'CASUALS (All)', href: '/category/casuals' },
      { label: 'CASUALS → FEEDING', href: '/category/casuals/feeding' },
      { label: 'CASUALS → NON-FEEDING', href: '/category/casuals/non-feeding' },
      { label: 'PARTY WEAR (All)', href: '/category/party-wear' },
      { label: 'PARTY WEAR → FEEDING', href: '/category/party-wear/feeding' },
      { label: 'PARTY WEAR → NON-FEEDING', href: '/category/party-wear/non-feeding' },
    ],
  },
  {
    title: 'ETHNIC, TOPS & STANDALONE',
    links: [
      { label: 'ETHNIC WEAR (All)', href: '/category/ethnic-wear' },
      { label: 'ETHNIC WEAR → FEEDING', href: '/category/ethnic-wear/feeding' },
      { label: 'ETHNIC WEAR → NON-FEEDING', href: '/category/ethnic-wear/non-feeding' },
      { label: 'PEPLUM TOPS (All)', href: '/category/peplum-tops' },
      { label: 'PEPLUM TOPS → FEEDING', href: '/category/peplum-tops/feeding' },
      { label: 'PEPLUM TOPS → NON-FEEDING', href: '/category/peplum-tops/non-feeding' },
      { label: 'LOUNGE WEAR', href: '/category/lounge-wear' },
      { label: 'KIDS WEAR', href: '/category/kids-wear' },
    ],
  },
];

interface MegaMenuProps {
  scrolled: boolean;
  onActiveChange?: (active: boolean) => void;
}

export function MegaMenu({ scrolled, onActiveChange }: MegaMenuProps) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCategoriesOpen(true);
    if (onActiveChange) onActiveChange(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setCategoriesOpen(false);
      if (onActiveChange) onActiveChange(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const isHome = pathname === '/';
  const isCategories = pathname.startsWith('/category') && !pathname.includes('/sale');
  const isSale = pathname === '/sale' || pathname === '/category/sale';
  const isTrackOrder = pathname === '/track-order';
  const isContact = pathname === '/contact';

  return (
    <nav
      className="hidden lg:flex items-center justify-center w-full"
      role="navigation"
      aria-label="Primary Navigation"
    >
      <ul className="flex items-center justify-center gap-1 xl:gap-2">

        <li className="relative">
          <Link
            href="/"
            className={cn(
              'px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-200 rounded-full inline-flex items-center',
              isHome
                ? 'text-[var(--color-primary-gold)] font-extrabold'
                : scrolled
                ? 'text-[var(--color-dark)] hover:text-[var(--color-primary-gold)]'
                : 'text-white hover:text-[var(--color-gold-light)]'
            )}
          >
            HOME
          </Link>
        </li>

        <li
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            href="/category/all"
            className={cn(
              'px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-200 rounded-full inline-flex items-center gap-1',
              isCategories || categoriesOpen
                ? 'text-[var(--color-primary-gold)] font-extrabold'
                : scrolled
                ? 'text-[var(--color-dark)] hover:text-[var(--color-primary-gold)]'
                : 'text-white hover:text-[var(--color-gold-light)]'
            )}
          >
            CATEGORIES
            <ChevronDown
              size={14}
              className={cn(
                'transition-transform duration-200',
                categoriesOpen && 'rotate-180 text-[var(--color-primary-gold)]'
              )}
            />
          </Link>

          <AnimatePresence>
            {categoriesOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed left-0 right-0 top-[60px] z-50 w-full bg-[#0D0D0D] border-b border-[var(--color-primary-gold)]/40 shadow-2xl text-white overflow-hidden"
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                }}
                onMouseLeave={handleMouseLeave}
              >
                <div className="mx-auto max-w-7xl px-8 py-8">
                  <div className="grid grid-cols-12 gap-8 items-center">

                    <div className="col-span-8 grid grid-cols-2 gap-8">
                      {CATEGORY_COLUMNS.map((col) => (
                        <div key={col.title}>
                          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[var(--color-primary-gold)]/30">
                            <Sparkles size={13} className="text-[var(--color-primary-gold)]" />
                            <h4 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-gold-light)]">
                              {col.title}
                            </h4>
                          </div>
                          <ul className="space-y-1.5">
                            {col.links.map((link) => (
                              <li key={link.label}>
                                <Link
                                  href={link.href}
                                  onClick={() => {
                                    setCategoriesOpen(false);
                                    if (onActiveChange) onActiveChange(false);
                                  }}
                                  className="group flex items-center justify-between text-xs font-medium text-white/85 hover:text-[var(--color-primary-gold)] transition-all py-1.5 px-3 rounded-lg hover:bg-white/10"
                                >
                                  <span>{link.label}</span>
                                  <ChevronRight
                                    size={12}
                                    className="opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-[var(--color-primary-gold)]"
                                  />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="col-span-4 relative overflow-hidden rounded-2xl border border-[var(--color-primary-gold)]/40 h-[220px] group shadow-gold-sm">
                      <Image
                        src="/images/hero/hero2.png"
                        alt="NEW SEASON"
                        fill
                        sizes="380px"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                      <div className="relative z-10 p-5 flex flex-col justify-end h-full">
                        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-gold-light)] mb-1">
                          NEW SEASON 2026
                        </span>
                        <h3 className="font-display text-lg font-bold text-white mb-1 leading-tight">
                          Explore the Latest YEZ BEE Collection
                        </h3>
                        <p className="text-xs text-white/70 mb-3 line-clamp-1">
                          Hand-crafted silks, lehengas & bespoke evening wear.
                        </p>
                        <Link
                          href="/category/all"
                          onClick={() => {
                            setCategoriesOpen(false);
                            if (onActiveChange) onActiveChange(false);
                          }}
                          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-dark)] bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] px-4 py-2 rounded-full w-fit hover:shadow-gold-sm transition-all"
                        >
                          SHOP NOW <ChevronRight size={13} />
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </li>

        <li className="relative">
          <Link
            href="/sale"
            className={cn(
              'px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-200 rounded-full inline-flex items-center gap-1.5',
              isSale
                ? 'text-[var(--color-soft-red)] font-extrabold'
                : scrolled
                ? 'text-[var(--color-soft-red)] hover:text-[var(--color-soft-red)] font-bold'
                : 'text-white hover:text-[var(--color-gold-light)]'
            )}
          >
            <Tag size={13} className="text-[var(--color-soft-red)] animate-pulse" />
            SALE
          </Link>
        </li>

        <li className="relative">
          <Link
            href="/track-order"
            className={cn(
              'px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-200 rounded-full inline-flex items-center gap-1.5',
              isTrackOrder
                ? 'text-[var(--color-primary-gold)] font-extrabold'
                : scrolled
                ? 'text-[var(--color-dark)] hover:text-[var(--color-primary-gold)]'
                : 'text-white hover:text-[var(--color-gold-light)]'
            )}
          >
            <Package size={13} className="opacity-70" />
            TRACK ORDER
          </Link>
        </li>

        <li className="relative">
          <Link
            href="/contact"
            className={cn(
              'px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-200 rounded-full inline-flex items-center gap-1.5',
              isContact
                ? 'text-[var(--color-primary-gold)] font-extrabold'
                : scrolled
                ? 'text-[var(--color-dark)] hover:text-[var(--color-primary-gold)]'
                : 'text-white hover:text-[var(--color-gold-light)]'
            )}
          >
            <Mail size={13} className="opacity-70" />
            CONTACT
          </Link>
        </li>

      </ul>
    </nav>
  );
}
