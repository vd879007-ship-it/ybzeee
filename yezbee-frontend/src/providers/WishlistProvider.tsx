'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import { useWishlistStore } from '@/store/wishlist-store';
import { useNotificationStore } from '@/store/notification-store';

export interface WishlistItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category?: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  itemCount: number;
  isInWishlist: (productId: string | number) => boolean;
  isWishlisted: (productId: string | number) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  toggle: (productId: string, variantId?: string) => void;
  remove: (productId: string) => void;
  removeFromWishlist: (productId: string | number) => void;
  clear: () => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const store = useWishlistStore();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const isInWishlist = useCallback(
    (productId: string | number) => {
      const idStr = String(productId);
      return wishlistItems.some((i) => String(i.id) === idStr) || store.isWishlisted(idStr);
    },
    [wishlistItems, store]
  );

  const toggleWishlist = useCallback(
    (item: WishlistItem) => {
      const idStr = String(item.id);
      const exists = wishlistItems.some((i) => String(i.id) === idStr);

      if (exists) {
        setWishlistItems((prev) => prev.filter((i) => String(i.id) !== idStr));
        addNotification({
          type: 'info',
          title: 'Removed from Wishlist',
          message: `${item.name} removed from your wishlist.`,
        });
      } else {
        setWishlistItems((prev) => [...prev, item]);
        addNotification({
          type: 'success',
          title: 'Saved to Wishlist',
          message: `${item.name} saved to your luxury wishlist.`,
        });
      }
      store.toggle(idStr);
    },
    [wishlistItems, store, addNotification]
  );

  const removeFromWishlist = useCallback(
    (productId: string | number) => {
      const idStr = String(productId);
      setWishlistItems((prev) => prev.filter((i) => String(i.id) !== idStr));
      store.remove(idStr);
    },
    [store]
  );

  const toggle = useCallback(
    (productId: string, variantId?: string) => {
      const wasWishlisted = store.isWishlisted(productId);
      store.toggle(productId, variantId);

      addNotification({
        type: wasWishlisted ? 'info' : 'success',
        title: wasWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
        message: wasWishlisted
          ? 'Item removed from your wishlist.'
          : 'Item saved to your wishlist.',
      });
    },
    [store, addNotification]
  );

  const value: WishlistContextValue = {
    items: wishlistItems,
    itemCount: wishlistItems.length || store.items.length,
    isInWishlist,
    isWishlisted: (id) => isInWishlist(id),
    toggleWishlist,
    toggle,
    remove: store.remove,
    removeFromWishlist,
    clear: () => {
      setWishlistItems([]);
      store.clear();
    },
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
