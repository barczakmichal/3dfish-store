'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  slug: string;
}

export default function ProductImage({ src, alt, slug }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [imgError, setImgError] = useState(false);

  const handleError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(`/images/products/${slug}.svg`);
    } else {
      setImgSrc('/images/products/placeholder.svg');
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 100vw, 50vw"
      priority
      onError={handleError}
    />
  );
}
