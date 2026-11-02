import Link from 'next/link';
import Image from 'next/image';
import {
  Instagram,
  Youtube,
  Facebook,
  MessageCircle,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { FaPinterestP as Pinterest } from 'react-icons/fa';
import { cn } from '@/lib/utils';

const footerColumns = [
  {
    title: 'SHOP',
    links: [
      { label: 'CASUALS', href: '/category/casuals' },
      { label: 'PARTY WEAR', href: '/category/party-wear' },
      { label: 'ETHNIC WEAR', href: '/category/ethnic-wear' },
      { label: 'LOUNGE WEAR', href: '/category/lounge-wear' },
      { label: 'PEPLUM TOPS', href: '/category/peplum-tops' },
      { label: 'KIDS WEAR', href: '/category/kids-wear' },
    ],
  },
  {
    title: 'CUSTOMER CARE',
    links: [
      { label: 'Track Order', href: '/track-order' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns & Exchange', href: '/returns' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { label: 'About YEZ BEE', href: '/about' },
      { label: 'Our Story', href: '/about' },
      { label: 'Retail Outlets', href: '/contact' },
      { label: 'Franchise Enquiry', href: '/contact' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Refund Policy', href: '/refund' },
      { label: 'Shipping Policy', href: '/shipping' },
    ],
  },
];

const socialLinks = [
  { icon: Instagram, href: 'https://www.instagram.com/yezbeefashion?igsi=MTRwZm1rNzdrc2h0bw==', label: 'Instagram' },
  { icon: Facebook, href: 'https://www.facebook.com/share/1GoBY9GSPB/', label: 'Facebook' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  { icon: Pinterest, href: 'https://pinterest.com', label: 'Pinterest' },
  { icon: MessageCircle, href: 'https://wa.me/918760890906', label: 'WhatsApp' },
];

const paymentMethods = [
  { name: 'Visa', gradient: 'from-blue-700 to-blue-500' },
  { name: 'Mastercard', gradient: 'from-orange-600 to-red-500' },
  { name: 'UPI', gradient: 'from-green-700 to-green-500' },
  { name: 'COD Available', gradient: 'from-purple-700 to-purple-500' },
  { name: '256-Bit SSL', gradient: 'from-blue-600 to-cyan-500' },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--color-dark)] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-1">
              <div className="mb-4">
                <Link href="/" className="inline-block group">
                  <Image
                    src="/logo.png"
                    alt="YEZ BEE Fashion"
                    width={240}
                    height={80}
                    className="h-16 sm:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              </div>
              <p className="mb-6 text-xs leading-relaxed text-white/60 font-sans">
                India&apos;s premier luxury fashion destination. Curating
                elegance, celebrating individuality — handcrafted with passion.
              </p>
              <div className="flex items-center gap-2.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200',
                      'border border-white/15 text-white/60 hover:border-[var(--color-primary-gold)] hover:text-[var(--color-primary-gold)] hover:scale-105'
                    )}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary-gold)]">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-xs text-white/60 transition-colors hover:text-white"
                      >
                        {link.label}
                        <ChevronRight
                          size={11}
                          className="opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-[var(--color-primary-gold)]"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary-gold)]">
                JOIN THE YEZ BEE CLUB
              </h4>
              <p className="text-xs text-white/50 mb-3">
                Subscribe for private preview access to new couture drops and exclusive offers.
              </p>
              <div className="flex max-w-md gap-2">
                <div className="relative flex-1">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    suppressHydrationWarning
                    className={cn(
                      'w-full rounded-full border border-white/15 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white',
                      'placeholder:text-white/30 outline-none transition-colors focus:border-[var(--color-primary-gold)]'
                    )}
                    aria-label="Email for newsletter"
                  />
                </div>
                <button
                  suppressHydrationWarning
                  className={cn(
                    'rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200',
                    'bg-[var(--color-primary-gold)] text-[var(--color-dark)]',
                    'hover:bg-[var(--color-gold-light)]'
                  )}
                >
                  Subscribe
                </button>
              </div>
            </div>

            <div className="md:text-right">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary-gold)]">
                100% SECURE CHECKOUT
              </h4>
              <div className="flex flex-wrap md:justify-end gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method.name}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-[11px] font-semibold text-white',
                      `bg-gradient-to-r ${method.gradient}`
                    )}
                  >
                    {method.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-[11px] text-white/40">
              &copy; {new Date().getFullYear()} YEZ BEE Fashion. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-white/40">
              <Link href="/privacy" className="hover:text-white/70">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white/70">
                Terms of Service
              </Link>
              <Link href="/refund" className="hover:text-white/70">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
