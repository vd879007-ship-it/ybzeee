'use client';

import { useEffect, useRef, useCallback } from 'react';

interface LenisInstance {
  raf: (time: number) => void;
  destroy: () => void;
  scrollTo: (target: string | HTMLElement | number, options?: Record<string, unknown>) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
}

interface UseLenisOptions {
  autoRaf?: boolean;
  duration?: number;
  easing?: (t: number) => number;
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  orientation?: 'vertical' | 'horizontal';
}

export function useLenis(options: UseLenisOptions = {}) {
  const {
    autoRaf = true,
    duration = 1.2,
    smoothWheel = true,
    wheelMultiplier = 1,
    touchMultiplier = 1,
    orientation = 'vertical',
  } = options;

  const lenisRef = useRef<LenisInstance | null>(null);

  useEffect(() => {
    let lenis: LenisInstance | null = null;

    const initLenis = async () => {
      try {
        const Lenis = (await import('lenis')).default;
        lenis = new Lenis({
          duration,
          smoothWheel,
          wheelMultiplier,
          touchMultiplier,
          orientation,
        }) as unknown as LenisInstance;

        lenisRef.current = lenis;

        if (autoRaf) {
          const raf = (time: number) => {
            lenis?.raf(time);
            requestAnimationFrame(raf);
          };
          requestAnimationFrame(raf);
        }
      } catch {
        console.warn('Lenis smooth scroll not available');
      }
    };

    initLenis();

    return () => {
      if (lenis) {
        lenis.destroy();
      }
      lenisRef.current = null;
    };
  }, [autoRaf, duration, smoothWheel, wheelMultiplier, touchMultiplier, orientation]);

  const scrollTo = useCallback(
    (target: string | HTMLElement | number, scrollOptions?: Record<string, unknown>) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, scrollOptions);
      }
    },
    []
  );

  const on = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    if (lenisRef.current) {
      lenisRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    if (lenisRef.current) {
      lenisRef.current.off(event, callback);
    }
  }, []);

  return { lenis: lenisRef.current, scrollTo, on, off };
}
