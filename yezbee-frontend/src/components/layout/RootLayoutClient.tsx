'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { AuthModal } from '@/components/auth/AuthModal';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return (
      <main id="main-content" className="min-h-screen bg-[#FAF7F2]">
        {children}
      </main>
    );
  }

  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <MobileBottomNav />
      <WhatsAppButton />
      <AuthModal />
    </>
  );
}
