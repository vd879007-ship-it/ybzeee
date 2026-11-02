'use client';

import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="py-20 sm:py-28 bg-[var(--color-cream)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--color-dark)] px-6 py-16 sm:px-12 sm:py-20 lg:px-20">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--color-primary-gold)]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[var(--color-primary-gold)]/5 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-gold)]/20">
              <Mail
                size={24}
                className="text-[var(--color-primary-gold)]"
              />
            </div>

            <h2 className="mb-3 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Join the YEZ BEE Community
            </h2>

            <p className="mb-8 text-sm leading-relaxed text-white/60 sm:text-base">
              Be the first to know about exclusive drops, early access to sales,
              styling tips, and receive 15% off your first order.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  suppressHydrationWarning
                  className={cn(
                    'w-full rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm text-white outline-none transition-all',
                    'placeholder:text-white/30',
                    'focus:border-[var(--color-primary-gold)] focus:ring-1 focus:ring-[var(--color-primary-gold)]'
                  )}
                  aria-label="Email address"
                />
              </div>
              <button
                type="submit"
                suppressHydrationWarning
                className={cn(
                  'group inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all duration-200',
                  'bg-[var(--color-primary-gold)] text-[var(--color-dark)]',
                  'hover:bg-[var(--color-gold-light)] active:scale-[0.98]'
                )}
              >
                Subscribe
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>
            </form>

            <p className="mt-4 text-xs text-white/30">
              No spam. Unsubscribe anytime. By subscribing, you agree to our{' '}
              <a
                href="/privacy"
                className="underline underline-offset-2 hover:text-white/50"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
