'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TrustBadgeItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TrustBadgeProps {
  items?: TrustBadgeItem[];
  className?: string;
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'dark' | 'minimal';
}

const defaultItems: TrustBadgeItem[] = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="12" x="3" y="7" rx="2" />
        <path d="M3 11h18" />
        <path d="M7 15h.01" />
        <path d="M11 15h2" />
      </svg>
    ),
    title: 'Secure Payment',
    description: '100% secure & encrypted checkout',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: 'Free Delivery',
    description: 'Free shipping on orders above ₹999',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 15H2a9 9 0 0 1 9-9 9 9 0 0 1 9 9" />
        <path d="M18 10v5H5" />
        <path d="m8 17 3 3 3-3" />
      </svg>
    ),
    title: 'Easy Returns',
    description: '30-day hassle-free return policy',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: 'Authentic Products',
    description: '100% genuine & premium quality',
  },
];

const gridCols = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
};

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  items = defaultItems,
  className,
  columns = 4,
  variant = 'default',
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border',
        variant === 'dark'
          ? 'bg-[var(--color-darker)] border-[var(--color-primary-gold)]/10'
          : variant === 'minimal'
          ? 'bg-transparent border-transparent'
          : 'bg-[var(--color-warm-white)] border-[var(--color-champagne)]',
        className
      )}
    >
      <div className={cn('grid divide-x divide-[var(--color-champagne)]', gridCols[columns])}>
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              'flex flex-col items-center text-center p-5 gap-2.5',
              variant === 'dark' ? 'divide-[var(--color-primary-gold)]/10' : ''
            )}
          >
            <div
              className={cn(
                'text-[var(--color-primary-gold)]',
                variant === 'dark' && 'text-[var(--color-gold-light)]'
              )}
            >
              {item.icon}
            </div>
            <h4
              className={cn(
                'font-display text-sm font-semibold',
                variant === 'dark'
                  ? 'text-[var(--color-warm-white)]'
                  : 'text-[var(--color-dark)]'
              )}
            >
              {item.title}
            </h4>
            <p
              className={cn(
                'text-xs leading-relaxed',
                variant === 'dark'
                  ? 'text-[var(--color-gold-dark)]'
                  : 'text-[var(--color-gold-dark)]/70'
              )}
            >
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

TrustBadge.displayName = 'TrustBadge';
