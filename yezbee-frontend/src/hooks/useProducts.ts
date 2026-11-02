'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { extractProducts, normalizeProduct } from '@/lib/utils';

export interface UseProductsOptions {
  limit?: number;
  category?: string;
  productType?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  featured?: boolean;
  search?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const limit = options.limit || 100;
  const category = options.category || 'all';
  const productType = options.productType || 'all';
  const isNew = Boolean(options.isNew);
  const isBestSeller = Boolean(options.isBestSeller);
  const featured = Boolean(options.featured);
  const search = options.search || '';

  return useQuery({
    queryKey: ['products', { limit, category, productType, isNew, isBestSeller, featured, search }],
    queryFn: async () => {
      const res = await api.getProducts({
        limit,
        category: category !== 'all' ? category : undefined,
        productType: productType !== 'all' ? productType : undefined,
        isNew: isNew ? true : undefined,
        isBestSeller: isBestSeller ? true : undefined,
        featured: featured ? true : undefined,
        search: search || undefined,
      });
      const raw = extractProducts(res);
      return raw.map(normalizeProduct).filter(Boolean);
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };
}
