import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: '3DFish - Akcesoria wędkarskie drukowane w 3D',
    template: '%s | 3DFish',
  },
  description:
    'Sklep internetowy z akcesoriami wędkarskimi drukowanymi w technologii 3D. Spławiki, uchwyty, organizery, lury i wiele więcej.',
  keywords: ['wędkarstwo', 'akcesoria wędkarskie', 'druk 3D', 'spławiki', 'uchwyty na wędki', 'sklep wędkarski', '3DFish'],
  authors: [{ name: '3DFish' }],
  creator: '3DFish',
  metadataBase: new URL('https://treefish.pl'),
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: 'https://treefish.pl',
    siteName: '3DFish',
    title: '3DFish - Akcesoria wędkarskie drukowane w 3D',
    description:
      'Sklep internetowy z akcesoriami wędkarskimi drukowanymi w technologii 3D. Spławiki, uchwyty, organizery, lury i wiele więcej.',
  },
  robots: {
    index: true,
    follow: true,
  },
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
