'use client';

import React from 'react';
import toast, { type ToastOptions } from 'react-hot-toast';
import { cn } from '@/lib/utils';

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    borderRadius: '0.75rem',
    padding: '14px 20px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    background: '#FAF7F2',
    color: '#1A1A1A',
    border: '1px solid #F5E6C8',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    maxWidth: '380px',
  },
};

const iconStyles = 'shrink-0';

const SuccessIcon = () => (
  <svg
    className={iconStyles}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2D6A4F"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    className={iconStyles}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#E74C3C"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

const LoadingIcon = () => (
  <svg
    className="animate-spin shrink-0"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#C9A84C"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-[var(--shadow-elevated)] border border-[var(--color-emerald)]/20',
          'bg-[var(--color-warm-white)] text-sm font-medium',
          t.visible ? 'animate-in fade-in slide-in-from-right-2' : 'animate-out fade-out'
        )}
        style={{ maxWidth: '380px' }}
      >
        <SuccessIcon />
        <span className="flex-1">{message}</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-[var(--color-gold-dark)]/50 hover:text-[var(--color-dark)] transition-colors"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    ),
    { ...defaultOptions, ...options }
  );
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-[var(--shadow-elevated)] border border-[var(--color-soft-red)]/20',
          'bg-[var(--color-warm-white)] text-sm font-medium',
          t.visible ? 'animate-in fade-in slide-in-from-right-2' : 'animate-out fade-out'
        )}
        style={{ maxWidth: '380px' }}
      >
        <ErrorIcon />
        <span className="flex-1">{message}</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-[var(--color-gold-dark)]/50 hover:text-[var(--color-dark)] transition-colors"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    ),
    { ...defaultOptions, ...options }
  );
};

export const showLoadingToast = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-[var(--shadow-elevated)] border border-[var(--color-primary-gold)]/20',
          'bg-[var(--color-warm-white)] text-sm font-medium',
          t.visible ? 'animate-in fade-in slide-in-from-right-2' : 'animate-out fade-out'
        )}
        style={{ maxWidth: '380px' }}
      >
        <LoadingIcon />
        <span className="flex-1">{message}</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-[var(--color-gold-dark)]/50 hover:text-[var(--color-dark)] transition-colors"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    ),
    { ...defaultOptions, duration: Infinity, ...options }
  );
};

export const showPremiumToast = (message: string, options?: ToastOptions) => {
  return toast.custom(
    (t) => (
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl px-5 py-3.5',
          'bg-gradient-to-r from-[var(--color-dark)] to-[var(--color-darker)]',
          'text-[var(--color-gold-light)] text-sm font-medium border border-[var(--color-primary-gold)]/30',
          'shadow-[var(--shadow-luxury)]',
          t.visible ? 'animate-in fade-in slide-in-from-right-2' : 'animate-out fade-out'
        )}
        style={{ maxWidth: '420px' }}
      >
        <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span className="flex-1">{message}</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-[var(--color-gold-dark)] hover:text-[var(--color-gold-light)] transition-colors"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    ),
    { ...defaultOptions, duration: 5000, ...options }
  );
};

export const dismissToast = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

export { toast };
