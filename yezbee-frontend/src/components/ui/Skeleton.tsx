'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Shimmer: React.FC<SkeletonBaseProps> = ({ className, ...props }) => (
  <div className={cn('shimmer rounded', className)} aria-hidden="true" {...props} />
);

Shimmer.displayName = 'Shimmer';

export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-2.5', className)} aria-label="Loading text" role="status">
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          className={cn('h-3', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
};

TextSkeleton.displayName = 'TextSkeleton';

export const ImageSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Shimmer
      className={cn('aspect-square w-full', className)}
      aria-label="Loading image"
      role="status"
    />
  );
};

ImageSkeleton.displayName = 'ImageSkeleton';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-[var(--color-champagne)] overflow-hidden" role="status" aria-label="Loading product">
      <ImageSkeleton />
      <div className="p-4 space-y-3">
        <Shimmer className="h-4 w-2/3" />
        <Shimmer className="h-3 w-1/3" />
        <Shimmer className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
};

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl overflow-hidden" role="status" aria-label="Loading category">
      <Shimmer className="aspect-[4/3] w-full" />
      <div className="p-3 space-y-2">
        <Shimmer className="h-4 w-1/2 mx-auto" />
      </div>
    </div>
  );
};

CategoryCardSkeleton.displayName = 'CategoryCardSkeleton';

export const CartItemSkeleton: React.FC = () => {
  return (
    <div
      className="flex gap-4 p-4 border-b border-[var(--color-champagne)]"
      role="status"
      aria-label="Loading cart item"
    >
      <Shimmer className="h-20 w-20 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-2/3" />
        <Shimmer className="h-3 w-1/4" />
        <div className="flex items-center justify-between mt-3">
          <Shimmer className="h-8 w-24 rounded-lg" />
          <Shimmer className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
};

CartItemSkeleton.displayName = 'CartItemSkeleton';

export const ReviewSkeleton: React.FC = () => {
  return (
    <div className="flex gap-4 p-4" role="status" aria-label="Loading review">
      <Shimmer className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-1/4" />
        <Shimmer className="h-3 w-1/6" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-5/6" />
      </div>
    </div>
  );
};

ReviewSkeleton.displayName = 'ReviewSkeleton';

export const OrderSummarySkeleton: React.FC = () => {
  return (
    <div className="space-y-3 p-4" role="status" aria-label="Loading order summary">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-3 w-16" />
        </div>
      ))}
      <Shimmer className="h-px w-full my-2" />
      <div className="flex justify-between">
        <Shimmer className="h-4 w-16" />
        <Shimmer className="h-4 w-20" />
      </div>
    </div>
  );
};

OrderSummarySkeleton.displayName = 'OrderSummarySkeleton';

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="space-y-3" role="status" aria-label="Loading table">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Shimmer key={colIdx} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

TableSkeleton.displayName = 'TableSkeleton';
