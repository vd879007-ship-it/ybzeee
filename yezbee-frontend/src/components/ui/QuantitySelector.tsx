'use client';

import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: { button: 'h-7 w-7', input: 'h-7 w-10 text-xs', icon: 'w-3 h-3' },
  md: { button: 'h-9 w-9', input: 'h-9 w-12 text-sm', icon: 'w-4 h-4' },
  lg: { button: 'h-11 w-11', input: 'h-11 w-14 text-base', icon: 'w-5 h-5' },
};

const MinusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M5 12h14" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14" /><path d="M5 12h14" />
  </svg>
);

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  disabled = false,
  className,
}) => {
  const handleDecrement = useCallback(() => {
    if (value > min) onChange(value - 1);
  }, [value, min, onChange]);

  const handleIncrement = useCallback(() => {
    if (value < max) onChange(value + 1);
  }, [value, max, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed)) return;
    onChange(Math.min(Math.max(parsed, min), max));
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        'inline-flex items-center border border-[var(--color-champagne)] rounded-lg overflow-hidden',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={cn(
          styles.button,
          'flex items-center justify-center transition-colors duration-200',
          'text-[var(--color-dark)] hover:bg-[var(--color-champagne)]',
          'disabled:text-[var(--color-gold-dark)]/30 disabled:hover:bg-transparent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary-gold)]'
        )}
        aria-label="Decrease quantity"
      >
        <MinusIcon className={styles.icon} />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className={cn(
          styles.input,
          'text-center font-medium bg-[var(--color-warm-white)] border-x border-[var(--color-champagne)]',
          'outline-none text-[var(--color-dark)]'
        )}
        aria-label="Quantity"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={cn(
          styles.button,
          'flex items-center justify-center transition-colors duration-200',
          'text-[var(--color-dark)] hover:bg-[var(--color-champagne)]',
          'disabled:text-[var(--color-gold-dark)]/30 disabled:hover:bg-transparent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary-gold)]'
        )}
        aria-label="Increase quantity"
      >
        <PlusIcon className={styles.icon} />
      </button>
    </div>
  );
};

QuantitySelector.displayName = 'QuantitySelector';
