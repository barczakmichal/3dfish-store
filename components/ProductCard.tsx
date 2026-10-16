'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCartStore } from '@/lib/store';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  slug: string;
  isNew?: boolean;
  isBestseller?: boolean;
  marketingImageUrl?: string | null;
  packshotImageUrl?: string | null;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  category,
  slug,
  isNew,
  isBestseller,
  marketingImageUrl,
  packshotImageUrl,
}: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const formattedPrice = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(price);

  const primaryImage = image;
  const hoverImage =
    packshotImageUrl && marketingImageUrl
      ? packshotImageUrl === image
        ? marketingImageUrl
        : packshotImageUrl
      : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({ id, name, price, quantity: 1, image, slug });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {isNew && (
          <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Nowość
          </span>
        )}
        {isBestseller && (
          <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Bestseller
          </span>
        )}
      </div>

      {/* Product image with link */}
      <Link href={`/products/${slug}`} className="block">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage}
                alt={name}
                fill
                className={`object-cover transition-all duration-300 group-hover:scale-105 ${hoverImage ? 'group-hover:opacity-0' : ''}`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={name}
                  fill
                  className="object-cover transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-105 absolute inset-0"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 text-blue-200"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75 7.5 9l4.5 4.5 3-3.75 4.5 5.25H2.25Z"
                />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Product info */}
      <div className="p-4">
        <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">{category}</span>
        <Link href={`/products/${slug}`}>
          <h3 className="text-gray-900 font-semibold mt-1 group-hover:text-blue-700 transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-blue-700">{formattedPrice}</span>
          <button
            onClick={handleAddToCart}
            className={`text-sm text-white px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              added
                ? 'bg-green-500'
                : 'bg-blue-700 hover:bg-orange-500'
            }`}
          >
            {added ? '✓ Dodano!' : 'Dodaj do koszyka'}
          </button>
        </div>
      </div>
    </div>
  );
}
