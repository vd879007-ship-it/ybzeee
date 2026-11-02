'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'yezbee-recently-viewed';
const MAX_ITEMS = 10;

export interface RecentlyViewedItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  color?: string;
  viewedAt: string;
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      console.warn('Error reading recently viewed from localStorage');
    }
  }, []);

  const addItem = useCallback((item: Omit<RecentlyViewedItem, 'viewedAt'>) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const updated = [
        { ...item, viewedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_ITEMS);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        console.warn('Error saving recently viewed to localStorage');
      }

      return updated;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        console.warn('Error saving recently viewed to localStorage');
      }
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      console.warn('Error clearing recently viewed from localStorage');
    }
  }, []);

  return { items, addItem, removeItem, clearAll };
}
