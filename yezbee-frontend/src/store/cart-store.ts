import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variant: {
    id: string;
    color: string;
    size: string;
    sku: string;
  };
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxQuantity: number;
}

interface SavedItem {
  productId: string;
  variant: {
    id: string;
    color: string;
    size: string;
    sku: string;
  };
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxQuantity: number;
}

interface CartState {
  items: CartItem[];
  savedItems: SavedItem[];
  discountCode: string | null;
  discountAmount: number;
  notes: string;

  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  isInCart: (productId: string) => boolean;
  saveForLater: (productId: string, variantId: string) => void;
  moveToCart: (productId: string, variantId: string) => void;
  applyDiscount: (code: string, amount: number) => void;
  removeDiscount: () => void;
  setNotes: (notes: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      savedItems: [],
      discountCode: null,
      discountAmount: 0,
      notes: '',

      addItem: (item) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) => i.productId === item.productId && i.variant.id === item.variant.id
        );

        if (existingIndex >= 0) {
          const existing = items[existingIndex];
          const newQuantity = (item.quantity ?? 1) + existing.quantity;

          if (newQuantity > existing.maxQuantity) {
            return;
          }

          const updated = [...items];
          updated[existingIndex] = { ...existing, quantity: newQuantity };
          set({ items: updated });
        } else {
          const newItem: CartItem = {
            ...item,
            quantity: item.quantity ?? 1,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId, variantId) => {
        const { items } = get();
        set({ items: items.filter((i) => !(i.productId === productId && i.variant.id === variantId)) });
      },

      updateQuantity: (productId, variantId, quantity) => {
        const { items } = get();
        const index = items.findIndex(
          (i) => i.productId === productId && i.variant.id === variantId
        );

        if (index < 0) return;

        const clamped = Math.max(1, Math.min(quantity, items[index].maxQuantity));
        const updated = [...items];
        updated[index] = { ...updated[index], quantity: clamped };
        set({ items: updated });
      },

      clearCart: () => {
        set({ items: [], discountCode: null, discountAmount: 0, notes: '' });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      isInCart: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      saveForLater: (productId, variantId) => {
        const { items, savedItems } = get();
        const item = items.find(
          (i) => i.productId === productId && i.variant.id === variantId
        );
        if (!item) return;

        set({
          items: items.filter((i) => !(i.productId === productId && i.variant.id === variantId)),
          savedItems: [...savedItems, item],
        });
      },

      moveToCart: (productId, variantId) => {
        const { items, savedItems } = get();
        const item = savedItems.find(
          (i) => i.productId === productId && i.variant.id === variantId
        );
        if (!item) return;

        const existingIndex = items.findIndex(
          (i) => i.productId === productId && i.variant.id === variantId
        );

        if (existingIndex >= 0) {
          const existing = items[existingIndex];
          const updated = [...items];
          updated[existingIndex] = { ...existing, quantity: existing.quantity + item.quantity };
          set({ savedItems: savedItems.filter((i) => !(i.productId === productId && i.variant.id === variantId)), items: updated });
        } else {
          set({
            savedItems: savedItems.filter((i) => !(i.productId === productId && i.variant.id === variantId)),
            items: [...items, item],
          });
        }
      },

      applyDiscount: (code, amount) => {
        set({ discountCode: code, discountAmount: amount });
      },

      removeDiscount: () => {
        set({ discountCode: null, discountAmount: 0 });
      },

      setNotes: (notes) => {
        set({ notes });
      },
    }),
    {
      name: 'yezbee-cart',
      partialize: (state) => ({
        items: state.items,
        savedItems: state.savedItems,
        discountCode: state.discountCode,
        discountAmount: state.discountAmount,
        notes: state.notes,
      }),
    }
  )
);
