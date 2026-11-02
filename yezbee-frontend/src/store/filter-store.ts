import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ProductFilters {
  category: string[];
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  fabrics: string[];
  occasions: string[];
  ratings: number | null;
  discount: number | null;
  availability: 'all' | 'in_stock' | 'out_of_stock';
  search: string;
}

const defaultFilters: ProductFilters = {
  category: [],
  priceRange: [0, 100000],
  colors: [],
  sizes: [],
  fabrics: [],
  occasions: [],
  ratings: null,
  discount: null,
  availability: 'all',
  search: '',
};

interface FilterState {
  filters: ProductFilters;
  sortBy: string;
  viewMode: 'grid' | 'list';
  setFilter: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void;
  setSortBy: (value: string) => void;
  setViewMode: (value: 'grid' | 'list') => void;
  clearFilters: () => void;
  getActiveFilterCount: () => number;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      filters: { ...defaultFilters },
      sortBy: 'newest',
      viewMode: 'grid',

      setFilter: (key, value) => {
        const { filters } = get();
        set({ filters: { ...filters, [key]: value } });
      },

      setSortBy: (value) => {
        set({ sortBy: value });
      },

      setViewMode: (value) => {
        set({ viewMode: value });
      },

      clearFilters: () => {
        set({ filters: { ...defaultFilters }, sortBy: 'newest' });
      },

      getActiveFilterCount: () => {
        const { filters } = get();
        let count = 0;
        if (filters.category.length > 0) count += filters.category.length;
        if (filters.priceRange[0] !== defaultFilters.priceRange[0] || filters.priceRange[1] !== defaultFilters.priceRange[1]) count += 1;
        if (filters.colors.length > 0) count += filters.colors.length;
        if (filters.sizes.length > 0) count += filters.sizes.length;
        if (filters.fabrics.length > 0) count += filters.fabrics.length;
        if (filters.occasions.length > 0) count += filters.occasions.length;
        if (filters.ratings !== null) count += 1;
        if (filters.discount !== null) count += 1;
        if (filters.availability !== 'all') count += 1;
        if (filters.search) count += 1;
        return count;
      },
    }),
    {
      name: 'yezbee-filters',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
