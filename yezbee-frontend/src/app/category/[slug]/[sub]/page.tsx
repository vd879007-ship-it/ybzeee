'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { CategoryPageContent } from '../page';

export default function SubcategoryPage() {
  const params = useParams();
  const subSlug = (params.sub as string) || '';

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
      <CategoryPageContent subSlug={subSlug} />
    </Suspense>
  );
}
