'use client';

import { useState, useCallback, useMemo } from 'react';

export interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  originalPrice?: number;
  description: string;
  colors: Array<{ name: string; hex: string; image: string }>;
  sizes: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  fabric?: string;
  occasion?: string;
}

interface UseQuickViewReturn {
  isOpen: boolean;
  product: QuickViewProduct | null;
  productList: QuickViewProduct[];
  currentIndex: number;
  open: (product: QuickViewProduct) => void;
  close: () => void;
  goToNext: () => void;
  goToPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function useQuickView(products: QuickViewProduct[] = []): UseQuickViewReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<QuickViewProduct | null>(null);

  const currentIndex = useMemo(() => {
    if (!product || products.length === 0) return -1;
    return products.findIndex((p) => p.id === product.id);
  }, [product, products]);

  const hasNext = currentIndex >= 0 && currentIndex < products.length - 1;
  const hasPrev = currentIndex > 0;

  const open = useCallback(
    (product: QuickViewProduct) => {
      setProduct(product);
      setIsOpen(true);
    },
    []
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setProduct(null);
  }, []);

  const goToNext = useCallback(() => {
    if (hasNext && products[currentIndex + 1]) {
      setProduct(products[currentIndex + 1]);
    }
  }, [hasNext, products, currentIndex]);

  const goToPrev = useCallback(() => {
    if (hasPrev && products[currentIndex - 1]) {
      setProduct(products[currentIndex - 1]);
    }
  }, [hasPrev, products, currentIndex]);

  return {
    isOpen,
    product,
    productList: products,
    currentIndex,
    open,
    close,
    goToNext,
    goToPrev,
    hasNext,
    hasPrev,
  };
}
