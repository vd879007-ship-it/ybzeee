'use client';

import React, { forwardRef, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full bg-transparent transition-all duration-200 outline-none placeholder:text-[var(--color-gold-dark)]/40 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-[var(--color-champagne)] focus:border-[var(--color-primary-gold)] rounded-lg',
        gold:
          'border-2 border-[var(--color-primary-gold)] focus:border-[var(--color-gold-dark)] rounded-lg',
        dark: 'border border-[var(--color-dark)] focus:border-[var(--color-primary-gold)] rounded-lg bg-[var(--color-dark)] text-[var(--color-warm-white)]',
        underlined:
          'border-b-2 border-[var(--color-champagne)] focus:border-[var(--color-primary-gold)] rounded-none px-0',
      },
      size: {
        sm: 'h-9 text-xs px-3',
        md: 'h-11 text-sm px-4',
        lg: 'h-13 text-base px-5',
      },
      hasIcon: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      { hasIcon: true, size: 'sm', className: 'pl-9' },
      { hasIcon: true, size: 'md', className: 'pl-10' },
      { hasIcon: true, size: 'lg', className: 'pl-12' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hasIcon: false,
    },
  }
);

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  floatingLabel?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      floatingLabel = false,
      containerClassName,
      id: externalId,
      placeholder,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = externalId || generatedId;
    const hasValue = props.value !== undefined && props.value !== '';

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && !floatingLabel && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-dark)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gold-dark)] pointer-events-none">
              {leftIcon}
            </div>
          )}
          <div className="relative">
            <input
              id={inputId}
              ref={ref}
              suppressHydrationWarning
              className={cn(
                inputVariants({
                  variant,
                  size,
                  hasIcon: !!leftIcon,
                  className,
                }),
                error && 'border-[var(--color-soft-red)] focus:border-[var(--color-soft-red)]',
                floatingLabel && 'pt-5 pb-1'
              )}
              placeholder={floatingLabel ? ' ' : placeholder}
              aria-invalid={!!error}
              aria-describedby={
                error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
              }
              {...props}
            />
            {floatingLabel && (
              <label
                htmlFor={inputId}
                className={cn(
                  'absolute left-4 transition-all duration-200 pointer-events-none',
                  'text-[var(--color-gold-dark)]/60',
                  size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs',
                  hasValue || props.value
                    ? 'top-1 text-[10px]'
                    : 'top-1/2 -translate-y-1/2'
                )}
              >
                {label}
              </label>
            )}
          </div>
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gold-dark)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-xs text-[var(--color-soft-red)]"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-xs text-[var(--color-gold-dark)]/60">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'leftIcon' | 'variant'>>(
  (props, ref) => {
    return (
      <Input
        ref={ref}
        variant="default"
        leftIcon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        }
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
