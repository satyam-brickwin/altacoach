import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import NavbarWrapper from '@/components/NavbarWrapper';
import { Toaster } from "sonner";
import { ToastProvider } from '@/contexts/ToastContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'altacoach - Business Coaching Platform',
  description: 'A comprehensive platform for business coaching and training',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <LanguageProvider>
          <DarkModeProvider>
            <AuthProvider>
              <ToastProvider>
                <NavbarWrapper />
                <main>{children}</main>
              </ToastProvider>
            </AuthProvider>
          </DarkModeProvider>
        </LanguageProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}