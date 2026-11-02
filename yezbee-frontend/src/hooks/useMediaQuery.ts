'use client';

import { useEffect, useState } from 'react';

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`);
}

export function useBreakpoints(): Record<Breakpoint, boolean> {
  const [sizes, setSizes] = useState<Record<Breakpoint, boolean>>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
  });

  useEffect(() => {
    const mediaQueries = Object.entries(breakpoints).map(([key, value]) => ({
      key: key as Breakpoint,
      query: window.matchMedia(`(min-width: ${value}px)`),
    }));

    const updateSizes = () => {
      const newSizes = mediaQueries.reduce(
        (acc, { key, query }) => {
          acc[key] = query.matches;
          return acc;
        },
        {} as Record<Breakpoint, boolean>
      );
      setSizes(newSizes);
    };

    updateSizes();

    const handlers = mediaQueries.map(({ key, query }) => {
      const handler = () => updateSizes();
      query.addEventListener('change', handler);
      return { query, handler };
    });

    return () => {
      handlers.forEach(({ query, handler }) => {
        query.removeEventListener('change', handler);
      });
    };
  }, []);

  return sizes;
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
