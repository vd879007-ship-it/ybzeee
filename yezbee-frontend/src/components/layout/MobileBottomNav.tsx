'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, ShoppingBag, User, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isAuthenticated, openAuthModal } = useAuth();

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const isActive = (href: string) => pathname === href;

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Catalogue', href: '/category/new-arrivals', icon: LayoutGrid },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      badge: wishlistCount,
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: ShoppingBag,
      badge: cartCount,
    },
    { label: 'Account', href: '/account', icon: User },
  ];

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 lg:hidden',
        'bg-white/95 backdrop-blur-md border-t border-[var(--color-champagne)]/60 shadow-dark-md',
        'pb-[env(safe-area-inset-bottom)]'
      )}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.label === 'Account' && !isAuthenticated) {
            return (
              <button
                key="mobile-account-auth"
                onClick={() => openAuthModal('login')}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all duration-200 text-[var(--color-dark)]/60 hover:text-[var(--color-dark)]'
                )}
              >
                <Icon size={20} />
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[var(--color-dark)]/60">
                  Account
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all duration-200',
                active
                  ? 'text-[var(--color-primary-gold)] font-bold'
                  : 'text-[var(--color-dark)]/60 hover:text-[var(--color-dark)]'
              )}
            >
              <div className="relative">
                <Icon size={20} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      'absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full',
                      'bg-[var(--color-primary-gold)] text-[9px] font-bold text-[var(--color-dark)] shadow-gold-sm',
                      'px-1'
                    )}
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] tracking-wider uppercase font-semibold',
                  active ? 'text-[var(--color-primary-gold)]' : 'text-[var(--color-dark)]/60'
                )}
              >
                {item.label}
              </span>
              {active && (
                <span
                  className={cn(
                    'absolute -top-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full',
                    'bg-[var(--color-primary-gold)]'
                  )}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
