'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-200 select-none',
  {
    variants: {
      variant: {
        gold: 'bg-[var(--color-primary-gold)] text-[var(--color-darker)]',
        dark: 'bg-[var(--color-dark)] text-[var(--color-warm-white)]',
        sale: 'bg-[var(--color-soft-red)] text-white',
        new: 'bg-[var(--color-emerald)] text-white',
        trending: 'bg-[var(--color-dark)] text-[var(--color-primary-gold)] border border-[var(--color-primary-gold)]',
        emerald: 'bg-[var(--color-emerald)] text-white',
        softRed: 'bg-[var(--color-soft-red)] text-white',
        outline: 'bg-transparent text-[var(--color-primary-gold)] border border-[var(--color-primary-gold)]',
        champagne: 'bg-[var(--color-champagne)] text-[var(--color-dark)]',
        warmWhite: 'bg-[var(--color-warm-white)] text-[var(--color-dark)] border border-[var(--color-champagne)]',
      },
      size: {
        sm: 'text-[10px] px-1.5 py-0.5 rounded',
        md: 'text-xs px-2.5 py-1 rounded-md',
        lg: 'text-sm px-3.5 py-1.5 rounded-lg',
      },
      dot: {
        true: 'gap-1.5',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size: 'md',
      dot: false,
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  size,
  dot,
  icon,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(badgeVariants({ variant, size, dot, className }))}
      role="status"
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'outline' ? 'bg-[var(--color-primary-gold)]' : 'bg-current'
          )}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
