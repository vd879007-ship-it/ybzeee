'use client';

import React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

const THEME_CONFIG = {
  defaultTheme: 'light',
  enableSystem: false,
  disableTransitionOnChange: true,
  attribute: 'data-theme' as const,
  themes: ['light', 'dark'],
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider {...THEME_CONFIG}>
      {children}
    </NextThemesProvider>
  );
}
