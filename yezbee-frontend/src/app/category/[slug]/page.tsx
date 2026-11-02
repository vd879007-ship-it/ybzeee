'use client';

import { Suspense } from 'react';
import CategoryPageContent from '@/components/category/CategoryPageContent';

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-warm-white)] flex items-center justify-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary-gold)]">
            Loading YEZ BEE Catalog...
          </p>
        </div>
      }
    >
      <CategoryPageContent />
    </Suspense>
  );
}
