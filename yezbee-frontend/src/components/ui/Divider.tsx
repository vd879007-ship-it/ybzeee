'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DividerProps {
  variant?: 'solid' | 'dashed' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const sizeStyles = {
  horizontal: { sm: 'h-px', md: 'h-0.5', lg: 'h-1' },
  vertical: { sm: 'w-px', md: 'w-0.5', lg: 'w-1' },
};

export const Divider: React.FC<DividerProps> = ({
  variant = 'solid',
  size = 'sm',
  children,
  className,
  orientation = 'horizontal',
}) => {
  if (children) {
    return (
      <div
        className={cn('flex items-center gap-4', className)}
        role="separator"
        aria-orientation={orientation}
      >
        <div
          className={cn(
            'flex-1',
            orientation === 'horizontal' ? sizeStyles.horizontal[size] : sizeStyles.vertical[size],
            variant === 'solid' && 'bg-[var(--color-champagne)]',
            variant === 'dashed' && 'border-t border-dashed border-[var(--color-champagne)]',
            variant === 'gradient' &&
              'bg-gradient-to-r from-transparent via-[var(--color-primary-gold)] to-transparent'
          )}
        />
        {typeof children === 'string' ? (
          <span className="text-xs font-medium text-[var(--color-gold-dark)]/60 whitespace-nowrap uppercase tracking-wider">
            {children}
          </span>
        ) : (
          children
        )}
        <div
          className={cn(
            'flex-1',
            orientation === 'horizontal' ? sizeStyles.horizontal[size] : sizeStyles.vertical[size],
            variant === 'solid' && 'bg-[var(--color-champagne)]',
            variant === 'dashed' && 'border-t border-dashed border-[var(--color-champagne)]',
            variant === 'gradient' &&
              'bg-gradient-to-r from-[var(--color-primary-gold)] via-[var(--color-gold-light)] to-transparent'
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        orientation === 'horizontal' ? 'w-full' : 'h-full',
        orientation === 'horizontal' ? sizeStyles.horizontal[size] : sizeStyles.vertical[size],
        variant === 'solid' && 'bg-[var(--color-champagne)]',
        variant === 'dashed' &&
          cn(
            orientation === 'horizontal' ? 'border-t' : 'border-l',
            'border-dashed border-[var(--color-champagne)] bg-transparent'
          ),
        variant === 'gradient' &&
          cn(
            orientation === 'horizontal'
              ? 'bg-gradient-to-r from-transparent via-[var(--color-primary-gold)] to-transparent'
              : 'bg-gradient-to-b from-transparent via-[var(--color-primary-gold)] to-transparent'
          ),
        className
      )}
      role="separator"
      aria-orientation={orientation}
    />
  );
};

Divider.displayName = 'Divider';
