'use client';

import React, { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-warm-white)] border border-[var(--color-champagne)]',
        elevated:
          'bg-[var(--color-warm-white)] shadow-[var(--shadow-elevated)] border border-[var(--color-champagne)]',
        bordered:
          'bg-transparent border-2 border-[var(--color-primary-gold)]',
        glass: 'glass-light',
        dark: 'bg-[var(--color-dark)] text-[var(--color-warm-white)] border border-[var(--color-gold-dark)]/20',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-7',
        xl: 'p-10',
      },
      hover: {
        none: '',
        lift: 'hover:-translate-y-1 hover:shadow-[var(--shadow-luxury)] cursor-pointer',
        glow: 'hover:shadow-[var(--shadow-luxury)] cursor-pointer',
        border: 'hover:border-[var(--color-primary-gold)] cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: 'none',
    },
  }
);

interface CardProps
  extends Omit<HTMLMotionProps<'div'>, 'variants'>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hover, className }))}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'custom';
  children?: React.ReactNode;
}

export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  className,
  aspectRatio = 'square',
  children,
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    custom: '',
  };

  return (
    <div className={cn('relative overflow-hidden', aspectClasses[aspectRatio], className)}>
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      {children && (
        <div className="absolute inset-0">{children}</div>
      )}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={cn('p-5', className)}>{children}</div>;
};

interface ProductCardProps extends Omit<CardProps, 'children'> {
  image: string;
  title: string;
  price: number;
  originalPrice?: number;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  onImageClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  title,
  price,
  originalPrice,
  badge,
  footer,
  onImageClick,
  ...cardProps
}) => {
  return (
    <Card variant="default" hover="lift" padding="none" className="group" {...cardProps}>
      <div className="relative" onClick={onImageClick}>
        <CardImage
          src={image}
          alt={title}
          aspectRatio="portrait"
        />
        {badge && (
          <div className="absolute top-3 left-3 z-10">{badge}</div>
        )}
      </div>
      <CardContent>
        <h3 className="font-display text-lg font-semibold text-[var(--color-dark)] mb-1 line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--color-primary-gold)]">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        {footer && <div className="mt-3">{footer}</div>}
      </CardContent>
    </Card>
  );
};
