'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, ShoppingBag, User as UserIcon, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { SearchModal } from './SearchModal';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isHomepage = pathname === '/';
  const isSolidHeader = !isHomepage || scrolled || menuActive;

  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isAuthenticated, openAuthModal, user } = useAuth();

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUserClick = () => {
    if (isAuthenticated) {
      router.push('/account');
    } else {
      openAuthModal('login');
    }
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 left-0 right-0 z-40 transition-all duration-300',
          isSolidHeader
            ? 'bg-white/95 backdrop-blur-xl shadow-soft-md border-b border-[var(--color-champagne)]/80 py-0'
            : 'bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-[2px] border-b border-white/10 py-0'
        )}
      >
        <div className="mx-auto flex h-13 sm:h-14 lg:h-[58px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center shrink-0">
            <Link href="/" className="shrink-0 group flex items-center py-0 -my-1">
              <Image
                src="/logo.png"
                alt="YEZ BEE Fashion"
                width={260}
                height={90}
                priority
                className={cn(
                  'h-12 sm:h-14 md:h-16 lg:h-[68px] w-auto object-contain transition-transform duration-300 group-hover:scale-105',
                  !isSolidHeader && 'brightness-0 invert'
                )}
              />
            </Link>
          </div>

          <div className="hidden lg:flex items-center justify-center flex-1 mx-4 xl:mx-8">
            <MegaMenu scrolled={isSolidHeader} onActiveChange={setMenuActive} />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              suppressHydrationWarning
              className={cn(
                'rounded-full p-2.5 transition-all duration-200 hover:scale-105',
                isSolidHeader
                  ? 'text-[var(--color-dark)] hover:bg-[var(--color-warm-white)]'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="Search Catalogue"
              title="Search"
            >
              <Search size={19} />
            </button>

            <Link
              href="/wishlist"
              className={cn(
                'relative hidden sm:flex rounded-full p-2.5 transition-all duration-200 hover:scale-105',
                isSolidHeader
                  ? 'text-[var(--color-dark)] hover:bg-[var(--color-warm-white)]'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="Saved Wishlist"
              title="Wishlist"
            >
              <Heart size={19} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary-gold)] text-[9px] font-bold text-[var(--color-dark)] shadow-gold-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleUserClick}
              className={cn(
                'hidden sm:flex items-center gap-1.5 rounded-full p-2.5 transition-all duration-200 hover:scale-105',
                isSolidHeader
                  ? 'text-[var(--color-dark)] hover:bg-[var(--color-warm-white)]'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="User Account"
              title={isAuthenticated ? `Account (${user?.name || 'User'})` : 'Sign In / Register'}
            >
              <UserIcon size={19} />
              {isAuthenticated && user?.name && (
                <span className="hidden xl:inline text-xs font-medium max-w-[80px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              )}
            </button>

            <Link
              href="/cart"
              className={cn(
                'relative rounded-full p-2.5 transition-all duration-200 hover:scale-105',
                isSolidHeader
                  ? 'text-[var(--color-dark)] hover:bg-[var(--color-warm-white)]'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="Shopping Bag"
              title="Bag"
            >
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary-gold)] text-[9px] font-bold text-[var(--color-dark)] shadow-gold-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              suppressHydrationWarning
              className={cn(
                'rounded-full p-2.5 transition-all duration-200 lg:hidden',
                isSolidHeader
                  ? 'text-[var(--color-dark)] hover:bg-[var(--color-warm-white)]'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={() => {
          setMobileMenuOpen(false);
          setSearchOpen(true);
        }}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
