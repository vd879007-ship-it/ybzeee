'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden shrink-0 select-none',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-14 w-14 text-lg',
        xl: 'h-20 w-20 text-2xl',
      },
      variant: {
        default: 'rounded-full',
        rounded: 'rounded-lg',
        square: 'rounded-none',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

type StatusType = 'online' | 'offline' | 'away';

const statusColors: Record<StatusType, string> = {
  online: 'bg-[var(--color-emerald)]',
  offline: 'bg-gray-400',
  away: 'bg-[var(--color-primary-gold)]',
};

const statusSizes: Record<string, string> = {
  sm: 'h-2 w-2 ring-1',
  md: 'h-2.5 w-2.5 ring-1.5',
  lg: 'h-3 w-3 ring-2',
  xl: 'h-4 w-4 ring-2',
};

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  initials?: string;
  name?: string;
  icon?: React.ReactNode;
  status?: StatusType;
  ring?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  initials,
  name,
  icon,
  status,
  ring = false,
  size,
  variant,
  className,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const displayInitials = initials || (name ? getInitials(name, size === 'sm' ? 1 : 2) : '?');

  const content = () => {
    if (src && !imgError) {
      return (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      );
    }

    if (icon) {
      return <span className="text-current">{icon}</span>;
    }

    return (
      <span className="font-semibold text-current" aria-hidden="true">
        {displayInitials}
      </span>
    );
  };

  return (
    <span
      className={cn(
        avatarVariants({ size, variant }),
        src && !imgError
          ? ''
          : 'bg-[var(--color-champagne)] text-[var(--color-gold-dark)]',
        ring && 'ring-2 ring-[var(--color-primary-gold)] ring-offset-2 ring-offset-[var(--color-warm-white)]',
        className
      )}
      role="img"
      aria-label={alt || name || 'Avatar'}
    >
      {content()}
      {status && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full',
            'ring-[var(--color-warm-white)]',
            statusColors[status],
            statusSizes[size || 'md']
          )}
          aria-label={status}
        />
      )}
    </span>
  );
};

Avatar.displayName = 'Avatar';

interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    alt?: string;
  }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  className,
}) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((avatar, index) => (
        <div
          key={index}
          className="-mr-2 last:mr-0 ring-2 ring-[var(--color-warm-white)] rounded-full"
        >
          <Avatar
            src={avatar.src}
            name={avatar.name}
            alt={avatar.alt}
            size={size}
          />
        </div>
      ))}
      {remaining > 0 && (
        <div className="ml-1 text-xs font-medium text-[var(--color-gold-dark)]/60">
          +{remaining}
        </div>
      )}
    </div>
  );
};

AvatarGroup.displayName = 'AvatarGroup';
