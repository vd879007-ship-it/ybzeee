'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const progressVariants = cva(
  'w-full bg-[var(--color-champagne)] rounded-full overflow-hidden',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
        xl: 'h-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const fillVariants = cva('h-full rounded-full transition-all duration-500', {
  variants: {
    variant: {
      gold: 'bg-gradient-to-r from-[var(--color-primary-gold)] to-[var(--color-gold-light)]',
      dark: 'bg-[var(--color-dark)]',
      emerald: 'bg-[var(--color-emerald)]',
    },
  },
  defaultVariants: {
    variant: 'gold',
  },
});

interface ProgressBarProps extends VariantProps<typeof progressVariants> {
  value: number;
  variant?: 'gold' | 'dark' | 'emerald';
  showLabel?: boolean;
  labelPosition?: 'inside' | 'right' | 'bottom';
  className?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  size,
  variant = 'gold',
  showLabel = false,
  labelPosition = 'right',
  className,
  animated = true,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {showLabel && labelPosition === 'right' && (
        <span className="text-xs font-medium text-[var(--color-gold-dark)] min-w-[2.5rem] text-right shrink-0">
          {Math.round(clampedValue)}%
        </span>
      )}
      <div className={cn(progressVariants({ size }), 'flex-1')} role="progressbar" aria-valuenow={clampedValue} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className={fillVariants({ variant })}
          initial={animated ? { width: 0 } : { width: `${clampedValue}%` }}
          whileInView={{ width: `${clampedValue}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {showLabel && labelPosition === 'inside' && size !== 'sm' && (
            <span className="flex h-full items-center justify-end pr-2 text-[10px] font-semibold text-[var(--color-darker)]">
              {Math.round(clampedValue)}%
            </span>
          )}
        </motion.div>
      </div>
      {showLabel && labelPosition === 'bottom' && (
        <span className="text-xs font-medium text-[var(--color-gold-dark)]">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

interface Step {
  label: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

interface StepsProgressProps {
  steps: Step[];
  currentStep: number;
  variant?: 'gold' | 'dark';
  className?: string;
}

export const StepsProgress: React.FC<StepsProgressProps> = ({
  steps,
  currentStep,
  variant = 'gold',
  className,
}) => {
  return (
    <div className={cn('flex items-center w-full', className)}>
      {steps.map((step, index) => {
        const isActive = index <= currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                  step.isCompleted || isActive
                    ? variant === 'gold'
                      ? 'bg-[var(--color-primary-gold)] text-[var(--color-darker)]'
                      : 'bg-[var(--color-dark)] text-[var(--color-warm-white)]'
                    : 'bg-[var(--color-champagne)] text-[var(--color-gold-dark)]/50',
                  isCurrent && 'ring-2 ring-offset-2 ring-[var(--color-primary-gold)]'
                )}
              >
                {step.isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 font-medium whitespace-nowrap',
                  isActive ? 'text-[var(--color-dark)]' : 'text-[var(--color-gold-dark)]/50'
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 -mt-5 transition-colors duration-300',
                  index < currentStep
                    ? variant === 'gold'
                      ? 'bg-[var(--color-primary-gold)]'
                      : 'bg-[var(--color-dark)]'
                    : 'bg-[var(--color-champagne)]'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

StepsProgress.displayName = 'StepsProgress';
