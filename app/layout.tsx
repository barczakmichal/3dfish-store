import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Script from 'next/script';
import MetaPixel from '@/components/MetaPixel';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'treefish - Akcesoria wędkarskie drukowane w 3D',
    template: '%s | treefish',
  },
  description:
    'Sklep internetowy z akcesoriami wędkarskimi drukowanymi w technologii 3D. Spławiki, uchwyty, organizery, lury i wiele więcej.',
  keywords: ['wędkarstwo', 'akcesoria wędkarskie', 'druk 3D', 'spławiki', 'uchwyty na wędki', 'sklep wędkarski', 'treefish'],
  authors: [{ name: 'treefish' }],
  creator: 'treefish',
  metadataBase: new URL('https://treefish.pl'),
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: 'https://treefish.pl',
    siteName: 'treefish',
    title: 'treefish - Akcesoria wędkarskie drukowane w 3D',
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'functionality_storage': 'denied',
                'personalization_storage': 'denied',
                'security_storage': 'granted',
                'wait_for_update': 500
              });
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">
        <MetaPixel />
        {children}
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="8786bee1-006e-4187-9a2d-7605ac80b9f4"
          data-blockingmode="auto"
          data-culture="PL"
          strategy="beforeInteractive"
        />
        <Script
          id="cookiebot-consent-handler"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function updateConsentFromCookiebot() {
                if (!window.Cookiebot || !window.Cookiebot.consent) return;
                var c = window.Cookiebot.consent;
                gtag('consent', 'update', {
                  'ad_storage': c.marketing ? 'granted' : 'denied',
                  'ad_user_data': c.marketing ? 'granted' : 'denied',
                  'ad_personalization': c.marketing ? 'granted' : 'denied',
                  'analytics_storage': c.statistics ? 'granted' : 'denied',
                  'functionality_storage': c.preferences ? 'granted' : 'denied',
                  'personalization_storage': c.preferences ? 'granted' : 'denied',
                });
              }
              window.addEventListener('CookiebotOnAccept', updateConsentFromCookiebot);
              window.addEventListener('CookiebotOnDecline', updateConsentFromCookiebot);
            `,
          }}
        />
      </body>
    </html>
  );
}
