'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Toaster } from 'react-hot-toast';
import { useStore } from '@/lib/store/useStore';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, initAuth } = useStore();
  const isAuthPage = pathname?.startsWith('/auth');

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated && !isAuthPage) {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isAuthPage, router]);

  if (isAuthPage) {
    return (
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster position="top-right" />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <Sidebar />
        <div className="ml-64">
          <Header />
          <main className="pt-16 min-h-screen">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

