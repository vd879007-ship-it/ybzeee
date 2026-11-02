'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Sparkles, Package } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { api } from '@/lib/api';
import { extractProducts, normalizeProduct } from '@/lib/utils';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(query);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api.getProducts({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const raw = extractProducts(res);
        const normalized = raw.map(normalizeProduct).filter(Boolean);
        if (!query.trim()) {
          setDbProducts(normalized);
        } else {
          const q = query.toLowerCase().trim();
          setDbProducts(
            normalized.filter(
              (p) =>
                (p.name && p.name.toLowerCase().includes(q)) ||
                (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
                (p.category && p.category.toLowerCase().includes(q)) ||
                (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
                (p.tags && Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q)))
            )
          );
        }
      })
      .catch((err) => {
        console.error('[SearchPage] API error:', err);
        if (isMounted) setDbProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} suppressHydrationWarning className="relative mb-8 max-w-2xl mx-auto">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary-gold)]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for kurtis, casuals, party wear, ethnic, feeding tops..."
            suppressHydrationWarning
            className="w-full pl-12 pr-28 py-4 bg-white border border-[var(--color-champagne)] rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:border-[var(--color-primary-gold)] shadow-soft-sm text-[var(--color-dark)]"
          />
          <button
            type="submit"
            suppressHydrationWarning
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-gold-sm transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[var(--color-champagne)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-primary-gold)]">
                YEZ BEE CATALOGUE SEARCH
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-dark)]">
              {query ? `Results for "${query}"` : 'Explore All Collections'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-semibold">{dbProducts.length} Items Found</span>
          </div>
        </div>

        {dbProducts.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-[var(--color-champagne)]/60 text-gray-400 space-y-3">
            <Package size={40} className="mx-auto opacity-40 text-gray-400" />
            <h3 className="font-display font-bold text-lg text-gray-700">No products matching your search</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto font-sans">
              Try searching with different keywords like &quot;casuals&quot;, &quot;feeding&quot;, &quot;ethnic&quot;, or &quot;party wear&quot;.
            </p>
            <Link
              href="/category/casuals"
              className="inline-block mt-4 px-6 py-2.5 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-full hover:shadow-gold-sm"
            >
              Browse Casuals Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {dbProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
              >
                <ProductCard {...(product as any)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-warm-white)] flex items-center justify-center">Searching YEZ BEE...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
