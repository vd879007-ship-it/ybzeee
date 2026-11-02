'use client';

import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useNotificationStore } from '@/store/notification-store';

export interface LocalCartItem {
  id: string | number;
  variantId?: string;
  name: string;
  price: number;
  image: string;
  color?: string;
  size?: string;
  quantity: number;
}

interface CartContextValue {
  items: LocalCartItem[];
  itemCount: number;
  totalAmount: number;
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  notes: string;
  checkoutUrl: string | null;
  addToCart: (item: LocalCartItem) => void;
  addItem: (item: any) => void;
  removeFromCart: (id: string | number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  proceedToShopifyCheckout: () => Promise<string | null>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const store = useCartStore();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('yezbee_cart');
      if (saved) {
        setLocalCart(JSON.parse(saved));
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('yezbee_cart', JSON.stringify(localCart));
    } catch {
    }
  }, [localCart]);

  const addToCart = useCallback(
    (item: LocalCartItem) => {
      setLocalCart((prev) => {
        const existingIndex = prev.findIndex(
          (i) => String(i.id) === String(item.id) && i.color === item.color && i.size === item.size
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += item.quantity || 1;
          return updated;
        }
        return [...prev, item];
      });

      addNotification({
        type: 'success',
        title: 'Added to Bag',
        message: `${item.name} has been added to your bag.`,
        link: '/cart',
      });
    },
    [addNotification]
  );

  const removeFromCart = useCallback((id: string | number) => {
    setLocalCart((prev) => prev.filter((i) => String(i.id) !== String(id)));
  }, []);

  const updateLocalQuantity = useCallback((id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setLocalCart((prev) =>
      prev.map((i) => (String(i.id) === String(id) ? { ...i, quantity } : i))
    );
  }, [removeFromCart]);

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const proceedToShopifyCheckout = useCallback(async (): Promise<string | null> => {
    if (localCart.length === 0) return null;

    try {
      const { shopifyCartCreate } = await import('@/lib/shopify');
      const lines = localCart
        .filter((item) => item.variantId)
        .map((item) => ({
          merchandiseId: item.variantId as string,
          quantity: item.quantity,
        }));

      if (lines.length > 0) {
        const cart = await shopifyCartCreate(lines);
        if (cart?.checkoutUrl) {
          setCheckoutUrl(cart.checkoutUrl);
          window.location.href = cart.checkoutUrl;
          return cart.checkoutUrl;
        }
      }
    } catch (err: any) {
      console.warn('[Shopify Checkout] Fallback to local checkout:', err.message);
    }
    return null;
  }, [localCart]);

  const totalAmount = localCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value: CartContextValue = {
    items: localCart,
    itemCount: localCart.reduce((sum, i) => sum + i.quantity, 0),
    totalAmount,
    subtotal: totalAmount,
    discountCode: store.discountCode,
    discountAmount: store.discountAmount,
    notes: store.notes,
    checkoutUrl,
    addToCart,
    addItem: addToCart,
    removeFromCart,
    removeItem: (productId) => removeFromCart(productId),
    updateQuantity: updateLocalQuantity,
    clearCart: () => setLocalCart([]),
    proceedToShopifyCheckout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
