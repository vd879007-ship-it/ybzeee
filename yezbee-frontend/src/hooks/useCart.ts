'use client';

import { useCallback, useMemo } from 'react';
import { useCartStore, CartItem } from '@/store/cart-store';
import { useNotificationStore } from '@/store/notification-store';

interface AddToCartParams {
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
  maxQuantity: number;
  quantity?: number;
}

export function useCart() {
  const store = useCartStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const addWithNotification = useCallback(
    (params: AddToCartParams) => {
      const { items } = useCartStore.getState();
      const existingIndex = items.findIndex(
        (i) => i.productId === params.productId && i.variant.id === params.variant.id
      );

      if (existingIndex >= 0) {
        const existing = items[existingIndex];
        const newQty = (params.quantity ?? 1) + existing.quantity;
        if (newQty > params.maxQuantity) {
          addNotification({
            type: 'warning',
            title: 'Quantity limit reached',
            message: `Only ${params.maxQuantity} items available for ${params.name}.`,
          });
          return;
        }
      }

      store.addItem(params);
      addNotification({
        type: 'success',
        title: 'Added to cart',
        message: `${params.name} has been added to your cart.`,
        link: '/cart',
      });
    },
    [store, addNotification]
  );

  const subtotal = useMemo(() => store.getSubtotal(), [store.items]);
  const itemCount = useMemo(() => store.getItemCount(), [store.items]);

  const shippingEstimate = useMemo(() => {
    const sub = subtotal;
    if (sub >= 15000) return 0;
    if (sub >= 5000) return 499;
    return 699;
  }, [subtotal]);

  const taxEstimate = useMemo(() => {
    return Math.round(subtotal * 0.12);
  }, [subtotal]);

  const discountAmount = store.discountAmount;

  const total = useMemo(() => {
    return Math.max(0, subtotal + shippingEstimate + taxEstimate - discountAmount);
  }, [subtotal, shippingEstimate, taxEstimate, discountAmount]);

  const crossSellThreshold = useMemo(() => {
    if (subtotal < 5000) return 5000 - subtotal;
    if (subtotal < 10000) return 10000 - subtotal;
    return null;
  }, [subtotal]);

  return {
    ...store,
    addWithNotification,
    subtotal,
    itemCount,
    shippingEstimate,
    taxEstimate,
    total,
    discountAmount,
    crossSellThreshold,
  };
}
