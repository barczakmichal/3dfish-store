'use client';

import { useEffect } from 'react';
import { trackViewContent, hasMarketingConsent } from '@/lib/meta-pixel';

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    category?: string;
  };
}

export default function MetaPixelViewContent({ product }: Props) {
  useEffect(() => {
    if (hasMarketingConsent()) {
      trackViewContent(product);
      return;
    }

    const handleConsent = () => {
      if (hasMarketingConsent()) trackViewContent(product);
    };
    window.addEventListener('CookiebotOnAccept', handleConsent);
    return () => window.removeEventListener('CookiebotOnAccept', handleConsent);
  }, [product.id]);

  return null;
}
