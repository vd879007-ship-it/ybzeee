'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface InfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  initialLoad?: boolean;
}

interface InfiniteScrollResult {
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  setHasMore: (value: boolean) => void;
}

export function useInfiniteScroll(
  onLoadMore: () => Promise<void> | void,
  options: InfiniteScrollOptions = {}
): InfiniteScrollResult {
  const { threshold = 0.1, rootMargin = '200px', initialLoad = false } = options;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setIsLoading(true);
    try {
      await onLoadMore();
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [onLoadMore, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingRef.current) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, hasMore, threshold, rootMargin]);

  useEffect(() => {
    if (initialLoad && hasMore) {
      loadMore();
    }
  }, []);

  return { sentinelRef, isLoading, hasMore, loadMore, setHasMore };
}
