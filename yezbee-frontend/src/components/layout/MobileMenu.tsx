'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  X,
  ChevronDown,
  Heart,
  ShoppingBag,
  User,
  Search,
  Tag,
  Package,
  Mail,
  Home,
  Grid,
  Instagram,
  Youtube,
  Facebook,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/providers/CartProvider';
import { useWishlist } from '@/providers/WishlistProvider';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}

const CATEGORY_ITEMS = [
  { label: 'CASUALS', href: '/category/casuals' },
  { label: '  ↳ FEEDING', href: '/category/casuals/feeding' },
  { label: '  ↳ NON-FEEDING', href: '/category/casuals/non-feeding' },
  { label: 'PARTY WEAR', href: '/category/party-wear' },
  { label: '  ↳ FEEDING', href: '/category/party-wear/feeding' },
  { label: '  ↳ NON-FEEDING', href: '/category/party-wear/non-feeding' },
  { label: 'ETHNIC WEAR', href: '/category/ethnic-wear' },
  { label: '  ↳ FEEDING', href: '/category/ethnic-wear/feeding' },
  { label: '  ↳ NON-FEEDING', href: '/category/ethnic-wear/non-feeding' },
  { label: 'LOUNGE WEAR', href: '/category/lounge-wear' },
  { label: 'PEPLUM TOPS', href: '/category/peplum-tops' },
  { label: '  ↳ FEEDING', href: '/category/peplum-tops/feeding' },
  { label: '  ↳ NON-FEEDING', href: '/category/peplum-tops/non-feeding' },
  { label: 'KIDS WEAR', href: '/category/kids-wear' },
];

export function MobileMenu({ isOpen, onClose, onOpenSearch }: MobileMenuProps) {
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const pathname = usePathname();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed left-0 top-0 z-50 flex h-full w-full max-w-xs sm:max-w-sm flex-col',
              'bg-[var(--color-warm-white)] shadow-2xl border-r border-[var(--color-champagne)]'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-champagne)] px-6 py-4">
              <Link href="/" onClick={onClose} className="inline-block">
                <Image
                  src="/logo.png"
                  alt="YEZ BEE Fashion"
                  width={220}
                  height={70}
                  className="h-13 sm:h-15 w-auto object-contain"
                />
              </Link>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-[var(--color-champagne)]/60 text-[var(--color-dark)]"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-dark)]/40 px-1 mb-2 block">
                  Menu
                </span>

                <Link
                  href="/"
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors',
                    pathname === '/'
                      ? 'bg-[var(--color-dark)] text-white'
                      : 'text-[var(--color-dark)] hover:bg-[var(--color-champagne)]/50'
                  )}
                >
                  <Home size={16} />
                  <span>HOME</span>
                </Link>

                <div>
                  <button
                    onClick={() => setCategoriesExpanded((prev) => !prev)}
                    className={cn(
                      'flex w-full items-center justify-between py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors',
                      pathname.startsWith('/category') && !pathname.includes('/sale')
                        ? 'bg-[var(--color-dark)] text-white'
                        : 'text-[var(--color-dark)] hover:bg-[var(--color-champagne)]/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Grid size={16} />
                      <span>CATEGORIES</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn(
                        'transition-transform duration-300',
                        categoriesExpanded && 'rotate-180 text-[var(--color-primary-gold)]'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {categoriesExpanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-7 space-y-1 py-2 border-l-2 border-[var(--color-primary-gold)]/40 ml-4 my-1"
                      >
                        {CATEGORY_ITEMS.map((child) => (
                          <li key={child.label}>
                            <Link
                              href={child.href}
                              onClick={onClose}
                              className="block py-1.5 text-xs font-semibold text-gray-700 hover:text-[var(--color-primary-gold)] transition-colors"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="/sale"
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors',
                    pathname === '/sale' || pathname === '/category/sale'
                      ? 'bg-[var(--color-soft-red)] text-white'
                      : 'text-[var(--color-soft-red)] hover:bg-[var(--color-blush)]'
                  )}
                >
                  <Tag size={16} />
                  <span>SALE</span>
                  <span className="ml-auto text-[9px] font-bold bg-[var(--color-soft-red)] text-white px-2 py-0.5 rounded-full uppercase">
                    UP TO 50% OFF
                  </span>
                </Link>

                <Link
                  href="/track-order"
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors',
                    pathname === '/track-order'
                      ? 'bg-[var(--color-dark)] text-white'
                      : 'text-[var(--color-dark)] hover:bg-[var(--color-champagne)]/50'
                  )}
                >
                  <Package size={16} />
                  <span>TRACK ORDER</span>
                </Link>

                <Link
                  href="/contact"
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 py-3 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors',
                    pathname === '/contact'
                      ? 'bg-[var(--color-dark)] text-white'
                      : 'text-[var(--color-dark)] hover:bg-[var(--color-champagne)]/50'
                  )}
                >
                  <Mail size={16} />
                  <span>CONTACT</span>
                </Link>
              </div>

              <div className="border-t border-[var(--color-champagne)]" />

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-dark)]/40 px-1 mb-2 block">
                  Quick Actions
                </span>

                <button
                  onClick={() => {
                    onClose();
                    onOpenSearch?.();
                  }}
                  className="flex w-full items-center gap-3 py-2.5 px-3 text-xs font-semibold text-[var(--color-dark)]/80 hover:text-[var(--color-primary-gold)] transition-colors"
                >
                  <Search size={16} /> Search Catalogue
                </button>

                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center justify-between py-2.5 px-3 text-xs font-semibold text-[var(--color-dark)]/80 hover:text-[var(--color-primary-gold)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Heart size={16} /> Saved Wishlist
                  </div>
                  {wishlistCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary-gold)] text-[9px] font-bold text-[var(--color-dark)]">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center gap-3 py-2.5 px-3 text-xs font-semibold text-[var(--color-dark)]/80 hover:text-[var(--color-primary-gold)] transition-colors"
                >
                  <User size={16} /> My Account
                </Link>

                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-between py-2.5 px-3 text-xs font-semibold text-[var(--color-dark)]/80 hover:text-[var(--color-primary-gold)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={16} /> Shopping Bag
                  </div>
                  {cartCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary-gold)] text-[9px] font-bold text-[var(--color-dark)]">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

            </div>

            <div className="border-t border-[var(--color-champagne)] px-6 py-4 bg-white/60">
              <div className="flex items-center justify-around text-gray-500">
                <a href="https://www.instagram.com/yezbeefashion?igsi=MTRwZm1rNzdrc2h0bw==" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-gold)] transition-colors" aria-label="Instagram"><Instagram size={18} /></a>
                <a href="#" className="hover:text-[var(--color-primary-gold)] transition-colors" aria-label="YouTube"><Youtube size={18} /></a>
                <a href="https://www.facebook.com/share/1GoBY9GSPB/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-gold)] transition-colors" aria-label="Facebook"><Facebook size={18} /></a>
                <a href="https://wa.me/918760890906" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-gold)] transition-colors" aria-label="WhatsApp"><MessageCircle size={18} /></a>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
