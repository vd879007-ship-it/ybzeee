'use client';

import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
}

const sizeStyles = {
  sm: 'h-9 text-xs px-3 pr-8',
  md: 'h-11 text-sm px-4 pr-10',
  lg: 'h-13 text-base px-5 pr-12',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      size = 'md',
      containerClassName,
      className,
      id: externalId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = externalId || generatedId;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--color-dark)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full appearance-none bg-[var(--color-warm-white)] border border-[var(--color-champagne)] rounded-lg',
              'transition-all duration-200 outline-none',
              'focus:border-[var(--color-primary-gold)] focus:ring-1 focus:ring-[var(--color-primary-gold)]',
              'text-[var(--color-dark)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              sizeStyles[size],
              error && 'border-[var(--color-soft-red)] focus:border-[var(--color-soft-red)] focus:ring-[var(--color-soft-red)]',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-gold-dark)]">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1 text-xs text-[var(--color-soft-red)]"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1 text-xs text-[var(--color-gold-dark)]/60">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
