'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { cn, getSafeImageUrl } from '@/lib/utils';

export interface ProductImageProps {
  src?: string | null;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  aspectRatioClass?: string;
  emptyLabel?: string;
  unoptimized?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export default function ProductImage({
  src,
  alt = 'Product image',
  fill = true,
  width,
  height,
  sizes,
  priority = false,
  className,
  containerClassName,
  aspectRatioClass = 'aspect-[3/4]',
  emptyLabel = 'No Image',
  unoptimized,
  loading = 'lazy',
  onLoad,
  onError,
}: ProductImageProps) {
  const safeSrc = getSafeImageUrl(src, '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [safeSrc]);

  if (!safeSrc || hasError) {
    return (
      <div
        className={cn(
          'relative w-full overflow-hidden bg-[#F7F4EE] flex flex-col items-center justify-center text-gray-400 gap-1.5 p-4 select-none',
          aspectRatioClass,
          containerClassName
        )}
      >
        <ImageIcon size={28} className="opacity-35 text-gray-500" />
        {emptyLabel && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400/80">
            {emptyLabel}
          </span>
        )}
      </div>
    );
  }

  const isDataOrBlob = safeSrc.startsWith('blob:') || safeSrc.startsWith('data:');

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-[#F7F4EE]',
        aspectRatioClass,
        containerClassName
      )}
    >
      {!isLoaded && (
        <div
          className="absolute inset-0 z-0 bg-[#F7F4EE] animate-pulse"
          style={{
            background: 'linear-gradient(90deg, #F7F4EE 0%, #EDE8DE 50%, #F7F4EE 100%)',
            backgroundSize: '200% 100%',
          }}
        />
      )}

      {fill ? (
        <Image
          src={safeSrc}
          alt={alt}
          fill
          sizes={sizes || '(max-width: 768px) 100vw, 50vw'}
          priority={priority}
          loading={priority ? undefined : loading}
          unoptimized={unoptimized ?? isDataOrBlob}
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            setHasError(true);
            onError?.();
          }}
          className={cn(
            'object-cover object-center transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      ) : (
        <Image
          src={safeSrc}
          alt={alt}
          width={width || 400}
          height={height || 500}
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : loading}
          unoptimized={unoptimized ?? isDataOrBlob}
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            setHasError(true);
            onError?.();
          }}
          className={cn(
            'object-cover object-center transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
        />
      )}
    </div>
  );
}
