import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  productId: string;
  variantId?: string;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (productId: string, variantId?: string) => void;
  isWishlisted: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
  moveToCart: (productId: string) => void;
  getItems: () => string[];
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (productId, variantId) => {
        const { items } = get();
        const exists = items.some((i) => i.productId === productId);

        if (exists) {
          set({ items: items.filter((i) => i.productId !== productId) });
        } else {
          set({
            items: [
              ...items,
              { productId, variantId, addedAt: new Date().toISOString() },
            ],
          });
        }
      },

      isWishlisted: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      remove: (productId) => {
        const { items } = get();
        set({ items: items.filter((i) => i.productId !== productId) });
      },

      clear: () => {
        set({ items: [] });
      },

      moveToCart: (productId) => {
        const { items } = get();
        const item = items.find((i) => i.productId === productId);
        if (item) {
          set({ items: items.filter((i) => i.productId !== productId) });
          const { useCartStore } = require('./cart-store');
          useCartStore.getState().addItem({ productId: item.productId, variant: { id: item.variantId || 'default', color: '', size: '', sku: '' }, name: '', image: '', price: 0, maxQuantity: 10, quantity: 1 });
        }
      },

      getItems: () => {
        return get().items.map((i) => i.productId);
      },
    }),
    {
      name: 'yezbee-wishlist',
    }
  )
);
