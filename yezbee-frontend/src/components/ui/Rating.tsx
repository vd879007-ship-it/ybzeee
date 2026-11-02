'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  showCount?: boolean;
  interactive?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const Star: React.FC<{
  filled: number;
  size: string;
  onClick?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
  interactive?: boolean;
}> = ({ filled, size, onClick, onHover, onLeave, interactive }) => {
  const id = React.useId();

  return (
    <svg
      className={cn(
        size,
        'transition-all duration-150',
        interactive && 'cursor-pointer hover:scale-110'
      )}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      role={interactive ? 'button' : 'img'}
      aria-label={interactive ? undefined : `${filled}-star`}
    >
      <defs>
        <linearGradient id={`star-grad-${id}`}>
          <stop offset="0%" stopColor="var(--color-primary-gold)" />
          <stop offset={`${filled * 100}%`} stopColor="var(--color-primary-gold)" />
          <stop offset={`${filled * 100}%`} stopColor="var(--color-champagne)" />
          <stop offset="100%" stopColor="var(--color-champagne)" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={`url(#star-grad-${id})`}
        stroke="var(--color-primary-gold)"
        strokeWidth="1"
      />
    </svg>
  );
};

export const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  size = 'md',
  count,
  showCount = false,
  interactive = false,
  className,
}) => {
  const [hoverValue, setHoverValue] = useState<number>(0);
  const displayValue = hoverValue || value;

  const handleClick = (starValue: number) => {
    if (interactive && onChange) {
      onChange(starValue === value ? starValue - 0.5 : starValue);
    }
  };

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${value} out of 5 stars${count ? ` (${count} reviews)` : ''}`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = displayValue >= star ? 1 : displayValue >= star - 0.5 ? 0.5 : 0;

        return (
          <Star
            key={star}
            filled={filled}
            size={sizeMap[size]}
            interactive={interactive}
            onClick={() => handleClick(star)}
            onHover={() => interactive && setHoverValue(star)}
            onLeave={() => interactive && setHoverValue(0)}
          />
        );
      })}
      {showCount && count !== undefined && (
        <span className="ml-1.5 text-xs text-[var(--color-gold-dark)]/60 font-medium">
          ({count})
        </span>
      )}
    </div>
  );
};

Rating.displayName = 'Rating';
