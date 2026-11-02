'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Star, Check, ImageIcon } from 'lucide-react';
import { cn, getSafeImageUrl } from '@/lib/utils';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';

export interface ProductCardProps {
  id: string | number;
  name: string;
  category?: string;
  productType?: string | null;
  price: number;
  comparePrice?: number | null;
  rating?: number | string;
  reviews?: number;
  image?: any;
  thumbnail?: any;
  images?: any;
  hoverImage?: string;
  colors?: Array<{ name: string; hex: string }>;
  sizes?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  discount?: number;
  stock?: number;
  onQuickView?: (id: string | number) => void;
  className?: string;
  [key: string]: any;
}

export default function ProductCard({
  id,
  name,
  category = 'Collection',
  productType,
  price,
  comparePrice,
  rating = 4.8,
  reviews = 18,
  image,
  thumbnail,
  images,
  hoverImage,
  colors = [{ name: 'Default', hex: '#C9A84C' }],
  sizes = ['S', 'M', 'L', 'XL'],
  isNew = false,
  isBestSeller = false,
  discount,
  stock = 8,
  onQuickView,
  className,
  ...rest
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const safeColors = Array.isArray(colors) && colors.length > 0 ? colors : [{ name: 'Default', hex: '#C9A84C' }];
  const safeSizes = Array.isArray(sizes) && sizes.length > 0 ? sizes : ['M'];

  const primaryImage = (() => {
    if (image) return getSafeImageUrl(image, '');
    if (thumbnail) return getSafeImageUrl(thumbnail, '');
    if (Array.isArray(images) && images.length > 0) {
      const primaryObj = images.find((i: any) => Boolean(i?.isPrimary));
      if (primaryObj) return getSafeImageUrl(primaryObj, '');
      return getSafeImageUrl(images[0], '');
    }
    if (typeof images === 'string') return getSafeImageUrl(images, '');
    if (Array.isArray(rest.galleryImages) && rest.galleryImages.length > 0) {
      return getSafeImageUrl(rest.galleryImages[0], '');
    }
    return '';
  })();
  const secondaryImage = hoverImage ? getSafeImageUrl(hoverImage, '') : '';

  const isWishlisted = isInWishlist(id);
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  const calcDiscount = discount || (comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0);

  const rawImage = isHovered && secondaryImage ? secondaryImage : primaryImage;
  const displayImage = imgError ? '' : rawImage;

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [rawImage]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id,
      name,
      price,
      image: primaryImage,
      color: safeColors[selectedColor]?.name || 'Default',
      size: safeSizes[0] || 'M',
      quantity: 1,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id,
      name,
      price,
      image: primaryImage,
      category,
    });
  };

  const productSlug = rest.slug || (typeof id === 'string' && !id.startsWith('gid://') ? id : (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : id));

  return (
    <div
      className={cn('group relative flex flex-col h-full overflow-hidden rounded-xl bg-white transition-all duration-500 hover:shadow-gold-md hover:-translate-y-1 border border-[var(--color-champagne)]/40', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F7F4EE]">
        <Link href={`/product/${productSlug}`} className="relative block h-full w-full">
          {displayImage && !imgLoaded && (
            <div
              className="absolute inset-0 z-0 bg-[#F7F4EE] animate-pulse"
              style={{
                background: 'linear-gradient(90deg, #F7F4EE 0%, #EDE8DE 50%, #F7F4EE 100%)',
                backgroundSize: '200% 100%',
              }}
            />
          )}

          {displayImage ? (
            <Image
              src={displayImage}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 opacity-100"
              loading="lazy"
              unoptimized={displayImage.startsWith('blob:') || displayImage.startsWith('data:')}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#F7F4EE] text-gray-400 gap-1.5 p-4 text-center select-none">
              <ImageIcon size={30} className="opacity-35 text-gray-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400/80">No Image</span>
            </div>
          )}
        </Link>

        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {isBestSeller && (
            <span className="inline-block rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[var(--color-primary-gold)] text-[var(--color-dark)] shadow-sm">
              Bestseller
            </span>
          )}
          {calcDiscount > 0 && (
            <span className="inline-block rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[var(--color-soft-red)] text-white shadow-sm">
              -{calcDiscount}% OFF
            </span>
          )}
        </div>

        <button
          onClick={handleWishlistToggle}
          suppressHydrationWarning
          className={cn(
            'absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 shadow-sm',
            isWishlisted
              ? 'bg-[var(--color-soft-red)] text-white scale-110'
              : 'bg-white/80 text-[var(--color-dark)] hover:bg-[var(--color-primary-gold)] hover:text-[var(--color-dark)]'
          )}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full transition-transform duration-300 group-hover:translate-y-0 p-3 bg-gradient-to-t from-[var(--color-dark)]/90 via-[var(--color-dark)]/60 to-transparent flex flex-col gap-2">
          {sizes.length > 0 && (
            <div className="hidden sm:flex flex-col items-center gap-0.5">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50">
                Available sizes
              </span>
              <span className="text-white/90 text-[11px] font-semibold tracking-wide">
                {sizes.slice(0, 6).join(' · ')}
                {sizes.length > 6 && <span className="text-white/50"> +{sizes.length - 6}</span>}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            {onQuickView && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView(id);
                }}
                suppressHydrationWarning
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/20 text-white text-xs font-semibold backdrop-blur-md hover:bg-white hover:text-[var(--color-dark)] transition-colors"
              >
                <Eye size={14} /> Quick View
              </button>
            )}
            <button
              onClick={handleAddToCart}
              suppressHydrationWarning
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-300',
                addedToCart
                  ? 'bg-[var(--color-emerald)] text-white'
                  : 'bg-[var(--color-primary-gold)] text-[var(--color-dark)] hover:bg-[var(--color-gold-light)]'
              )}
            >
              {addedToCart ? (
                <>
                  <Check size={14} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={14} /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 bg-white">
        <div className="flex items-center justify-between text-[11px] text-[var(--color-dark)]/50 font-medium uppercase tracking-wider mb-1">
          <span className="font-bold text-[var(--color-dark)]/70">{category} {productType ? `· ${productType}` : ''}</span>
          {stock <= 5 && stock > 0 && (
            <span className="text-[var(--color-soft-red)] font-semibold">Only {stock} left!</span>
          )}
        </div>

        <Link href={`/product/${productSlug}`} className="group-hover:text-[var(--color-primary-gold)] transition-colors">
          <h3 className="font-display text-base font-semibold text-[var(--color-dark)] line-clamp-1 mb-1">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center text-[var(--color-primary-gold)]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={star <= Math.round(numRating) ? 'fill-[var(--color-primary-gold)] text-[var(--color-primary-gold)]' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium text-[var(--color-dark)]/60">
            {numRating.toFixed(1)} ({reviews})
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-[var(--color-champagne)]/40">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-base font-bold text-[var(--color-dark)]">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-xs text-[var(--color-dark)]/40 line-through">
                ₹{comparePrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {safeColors.length > 0 && (
            <div className="flex items-center gap-1">
              {safeColors.slice(0, 3).map((c, i) => {
                const colorName = typeof c === 'string' ? c : c?.name || `Color-${i}`;
                const colorHex = typeof c === 'string' ? '#000000' : c?.hex || '#000000';
                return (
                  <button
                    key={`${colorName}-${i}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedColor(i);
                    }}
                    suppressHydrationWarning
                    className={cn(
                      'h-3.5 w-3.5 rounded-full border border-gray-300 transition-transform',
                      selectedColor === i && 'ring-2 ring-[var(--color-primary-gold)] ring-offset-1 scale-110'
                    )}
                    style={{ backgroundColor: colorHex }}
                    title={colorName}
                  />
                );
              })}
              {safeColors.length > 3 && (
                <span className="text-[10px] text-[var(--color-dark)]/50 font-medium">
                  +{safeColors.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
