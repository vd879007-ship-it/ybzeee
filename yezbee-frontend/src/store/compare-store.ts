import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_COMPARE_ITEMS = 4;

interface CompareState {
  items: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  isInCompare: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (productId) => {
        const { items } = get();
        if (items.includes(productId)) return;
        if (items.length >= MAX_COMPARE_ITEMS) return;
        set({ items: [...items, productId] });
      },

      remove: (productId) => {
        const { items } = get();
        set({ items: items.filter((id) => id !== productId) });
      },

      clear: () => {
        set({ items: [] });
      },

      isInCompare: (productId) => {
        return get().items.includes(productId);
      },
    }),
    {
      name: 'yezbee-compare',
    }
  )
);
