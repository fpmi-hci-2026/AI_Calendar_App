import type { Metadata } from 'next';
import './globals.css';
import MobileNavigation from '@/components/MobileNavigation';

export const metadata: Metadata = {
  title: 'Умный Календарь',
  description: 'Веб-приложение для управления событиями и задачами',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="md:pb-0 pb-16">
        {children}
        <MobileNavigation />
      </body>
    </html>
  );
}
