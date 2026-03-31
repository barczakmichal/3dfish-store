import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'WędkarskaFabryka3D - Akcesoria wędkarskie drukowane w 3D',
  description:
    'Sklep internetowy z akcesoriami wędkarskimi drukowanymi w technologii 3D. Kołowrotki, wędki, spławiki, haczyki i zanęty.',
  keywords: 'wędkarstwo, akcesoria wędkarskie, druk 3D, kołowrotki, spławiki, haczyki',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
