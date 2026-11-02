import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import '@/styles/globals.css'
import { AuthProvider } from '@/providers/AuthProvider'
import { CartProvider } from '@/providers/CartProvider'
import { WishlistProvider } from '@/providers/WishlistProvider'
import { CompareProvider } from '@/providers/CompareProvider'
import { Toaster } from 'react-hot-toast'
import { LenisProvider } from '@/providers/LenisProvider'
import QueryProvider from '@/providers/QueryProvider'
import RootLayoutClient from '@/components/layout/RootLayoutClient'
import LoadingScreen from '@/components/LoadingScreen'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "YEZ BEE FASHION - Luxury Women's Clothing | Premium Fashion Brand",
  description:
    'Discover luxury womenswear at YEZ BEE FASHION. Premium quality fabrics, timeless designs, and sophisticated elegance for the modern woman. Shop exclusive collections online.',
  keywords: [
    'luxury fashion',
    'womens clothing',
    'premium fashion brand',
    'designer wear',
    'YEZ BEE',
    'elegant dresses',
    'high-end fashion',
  ],
  openGraph: {
    title: "YEZ BEE FASHION - Luxury Women's Clothing",
    description: 'Premium quality fabrics, timeless designs, and sophisticated elegance for the modern woman.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'YEZ BEE FASHION',
  },
  twitter: {
    card: 'summary_large_image',
    title: "YEZ BEE FASHION - Luxury Women's Clothing",
    description: 'Premium quality fabrics, timeless designs, and sophisticated elegance for the modern woman.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://yezbeefashion.com' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A1A1A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-inter bg-warmWhite text-dark antialiased" suppressHydrationWarning>
        <LoadingScreen />
        <LenisProvider>
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <CompareProvider>
                    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-gold focus:text-dark focus:rounded-lg focus:outline-none">
                      Skip to main content
                    </a>
                    <RootLayoutClient>{children}</RootLayoutClient>
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 3000,
                        style: { background: '#1A1A1A', color: '#FAF7F2', fontFamily: 'var(--font-inter)' },
                        success: { iconTheme: { primary: '#C9A84C', secondary: '#FAF7F2' } },
                        error: { iconTheme: { primary: '#EF4444', secondary: '#FAF7F2' } },
                      }}
                    />
                  </CompareProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </QueryProvider>
        </LenisProvider>

      </body>
    </html>
  )
}
