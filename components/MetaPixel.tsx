'use client';

import { useEffect } from 'react';
import { initPixel, hasMarketingConsent } from '@/lib/meta-pixel';

export default function MetaPixel() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_META_PIXEL_ID) return;

    if (hasMarketingConsent()) {
      initPixel();
      return;
    }

    const handleConsent = () => {
      if (hasMarketingConsent()) initPixel();
    };

    window.addEventListener('CookiebotOnAccept', handleConsent);
    return () => window.removeEventListener('CookiebotOnAccept', handleConsent);
  }, []);

  return null;
}
