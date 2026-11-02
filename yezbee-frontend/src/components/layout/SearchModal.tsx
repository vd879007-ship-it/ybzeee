'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const TRENDING_SEARCHES = [
  'Zardozi Lehengas',
  'Evening Ball Gowns',
  'Banarasi Silk Sarees',
  'Structured Blazers',
  'Pearl Chokers',
  'Cocktail Dresses',
];

const POPULAR_PRODUCTS = [
  {
    name: 'Floral Cotton Casual Kurti',
    price: '₹1,899',
    image: '/images/hero/hero1.png',
    href: '/category/casuals',
  },
  {
    name: 'Festive Gown & Party Wear',
    price: '₹2,499',
    image: '/images/hero/hero2.png',
    href: '/category/party-wear',
  },
  {
    name: 'Ethnic Wear Kurti Set',
    price: '₹2,199',
    image: '/images/hero/hero3.png',
    href: '/category/ethnic-wear',
  },
  {
    name: 'Peplum Tops & Tunics',
    price: '₹1,499',
    image: '/images/hero/hero4.png',
    href: '/category/peplum-tops',
  },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const handleSearchSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    onClose();
    router.push(`/category/new-arrivals?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed inset-x-4 top-[10%] sm:top-[12%] z-50 mx-auto max-w-2xl overflow-hidden rounded-3xl',
              'bg-[var(--color-darker)]/95 border border-[var(--color-primary-gold)]/30 shadow-2xl text-white'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Search Catalogue"
          >
            <div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit(query);
                }}
                className="flex items-center border-b border-white/10 px-6 py-4"
              >
                <Search
                  size={20}
                  className="mr-3 shrink-0 text-[var(--color-primary-gold)]"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search gowns, sarees, lehengas, blazers..."
                  suppressHydrationWarning
                  className="flex-1 bg-transparent py-2 text-sm sm:text-base text-white outline-none placeholder:text-white/40 font-sans"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    suppressHydrationWarning
                    className="p-2 rounded-full bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold uppercase hover:bg-[var(--color-gold-light)] transition-all"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    suppressHydrationWarning
                    className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </form>

              <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp size={14} className="text-[var(--color-primary-gold)]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold-light)]">
                      Trending Searches
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearchSubmit(term)}
                        suppressHydrationWarning
                        className="rounded-full px-4 py-1.5 text-xs font-semibold bg-white/10 text-white/90 hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)] transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold-light)]">
                      Featured Recommendations
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {POPULAR_PRODUCTS.map((product) => (
                      <Link
                        key={product.name}
                        href={product.href}
                        onClick={onClose}
                        className="group flex flex-col gap-2 rounded-xl bg-white/5 p-2 hover:bg-white/10 transition-colors"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="150px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-white/90 truncate group-hover:text-[var(--color-primary-gold)]">
                            {product.name}
                          </p>
                          <p className="text-[10px] font-bold text-[var(--color-primary-gold)]">
                            {product.price}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 px-6 py-3 bg-black/40 text-[10px] text-white/40">
                <span>Press Enter to search</span>
                <span>ESC to exit</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
