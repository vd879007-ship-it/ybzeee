'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { getProductById } from '@/data/products';
import ProductDetailPage from '@/app/product/[slug]/page';

export default function AdminProductPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const product = useMemo(() => getProductById(id), [id]);

  if (!product) {
    return (
      <div className="p-12 text-center">
        <p className="font-bold text-gray-700">Product not found for preview.</p>
        <Link href="/admin/products" className="text-xs text-[var(--color-primary-gold)] underline font-bold mt-2 inline-block">
          Return to Admin Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)]">
      <div className="sticky top-0 z-50 bg-[var(--color-dark)] text-white px-6 py-3 border-b border-[var(--color-primary-gold)] flex flex-wrap items-center justify-between shadow-dark-lg text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-[10px] font-extrabold uppercase tracking-wider">
            ADMIN PREVIEW MODE
          </span>
          <span className="text-gray-300 font-mono">ID: {product.id}</span>
          <span className="text-gray-400">·</span>
          <span className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
            product.status === 'published' ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'
          }`}>
            Status: {product.status}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/products/${product.id}`}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Edit size={14} /> Back to Edit
          </Link>
          <Link
            href="/admin/products"
            className="px-3.5 py-1.5 bg-[var(--color-primary-gold)] text-[var(--color-dark)] hover:bg-[var(--color-gold-light)] rounded-lg transition-colors flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft size={14} /> Admin Products List
          </Link>
        </div>
      </div>

      <ProductDetailPage />
    </div>
  );
}
