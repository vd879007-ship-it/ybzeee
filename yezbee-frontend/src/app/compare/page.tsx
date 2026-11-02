'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Star, Sparkles, Scale } from 'lucide-react';
import { useCart } from '@/providers/CartProvider';

interface CompareProduct {
  id: number;
  name: string;
  image: string;
  price: number;
  comparePrice: number | null;
  rating: number;
  reviews: number;
  fabric: string;
  fit: string;
  neck: string;
  sleeve: string;
  length: string;
  pattern: string;
  colorOptions: number;
  inStock: boolean;
  category: string;
}

const INITIAL_PRODUCTS: CompareProduct[] = [];

const ATTRIBUTES = [
  { key: 'price', label: 'Price' },
  { key: 'fabric', label: 'Craft Fabric' },
  { key: 'fit', label: 'Silhouette / Fit' },
  { key: 'neck', label: 'Neckline Style' },
  { key: 'sleeve', label: 'Sleeve Length' },
  { key: 'length', label: 'Garment Length' },
  { key: 'pattern', label: 'Embroidery & Pattern' },
  { key: 'colorOptions', label: 'Available Colors' },
];

export default function ComparePage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const { addToCart } = useCart();

  const removeProduct = (id: number) => setProducts((prev) => prev.filter((p) => p.id !== id));

  const getAttrValue = (product: CompareProduct, key: string): string | number => {
    if (key === 'price') return `₹${product.price.toLocaleString()}${product.comparePrice ? ` (Original: ₹${product.comparePrice.toLocaleString()})` : ''}`;
    if (key === 'colorOptions') return `${product.colorOptions} Luxury Shades`;
    return product[key as keyof CompareProduct] as string;
  };

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-[var(--color-primary-gold)]" />
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-primary-gold)]">
            ATELIER COMPARISON
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--color-dark)] mb-2">
          Compare Couture Pieces
        </h1>
        <p className="text-xs text-[var(--color-dark)]/60 mb-8 font-sans">
          Compare fine silk fabrics, handcraft details, silhouettes, and pricing side by side.
        </p>

        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-[var(--color-champagne)] shadow-soft-sm text-center">
            <Scale size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="font-display text-xl font-bold text-[var(--color-dark)] mb-2">No Products Selected for Comparison</h2>
            <p className="text-xs text-gray-500 mb-6">Select products from the catalogue to compare features side by side.</p>
            <Link
              href="/category/new-arrivals"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-primary-gold)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[var(--color-gold-light)] transition-all"
            >
              Explore Catalogue
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[180px_repeat(auto-fill,minmax(220px,1fr))] gap-0 border border-[var(--color-champagne)] rounded-3xl overflow-hidden bg-white shadow-soft-md">
                <div className="bg-[var(--color-champagne)]/20 p-5 font-bold text-xs uppercase tracking-wider text-[var(--color-dark)] flex items-center border-b border-[var(--color-champagne)]">
                  Couture Details
                </div>
                {products.map((product) => (
                  <div key={product.id} className="bg-white p-5 border-l border-b border-[var(--color-champagne)]/60 relative flex flex-col justify-between">
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute top-3 right-3 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[var(--color-soft-red)] hover:text-white transition-all z-10"
                      aria-label="Remove product"
                    >
                      <X size={12} />
                    </button>
                    <div>
                      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden mb-4 bg-gray-100 shadow-soft-sm">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="250px"
                          className="object-cover object-center"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-[var(--color-primary-gold)] uppercase tracking-wider">{product.category}</p>
                      <Link href={`/product/${product.id}`} className="text-xs font-bold text-[var(--color-dark)] hover:text-[var(--color-primary-gold)] transition-colors block mt-1 line-clamp-2">
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={10} className="text-[var(--color-primary-gold)] fill-[var(--color-primary-gold)]" />
                        <span className="text-[10px] font-semibold text-gray-500">{product.rating} ({product.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-bold text-[var(--color-dark)]">₹{product.price.toLocaleString()}</span>
                        {product.comparePrice && (
                          <span className="text-xs text-gray-400 line-through">₹{product.comparePrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 })}
                      className="mt-4 w-full py-2.5 bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)] text-[var(--color-dark)] text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 hover:shadow-gold-sm transition-all"
                    >
                      <ShoppingBag size={14} /> Add to Bag
                    </button>
                  </div>
                ))}

                {ATTRIBUTES.map((attr) => (
                  <div key={attr.key} className="contents">
                    <div className="bg-[var(--color-champagne)]/10 p-4 font-bold text-xs text-[var(--color-dark)]/70 border-b border-r border-[var(--color-champagne)]/60 flex items-center">
                      {attr.label}
                    </div>
                    {products.map((product) => (
                      <div key={product.id} className="p-4 text-xs font-semibold text-[var(--color-dark)] border-b border-r border-[var(--color-champagne)]/60 bg-white flex items-center">
                        {getAttrValue(product, attr.key)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
