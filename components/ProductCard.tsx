'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  slug: string;
}

export default function ProductCard({ id, name, price, image, category, slug }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(price);

  return (
    <Link href={`/products/${slug}`} className="group">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Product image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
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

        {/* Product info */}
        <div className="p-4">
          <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">{category}</span>
          <h3 className="text-gray-900 font-semibold mt-1 group-hover:text-blue-700 transition-colors line-clamp-2">
            {name}
          </h3>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xl font-bold text-blue-700">{formattedPrice}</span>
            <span className="text-sm text-white bg-blue-700 px-3 py-1 rounded-full group-hover:bg-orange-500 transition-colors">
              Szczegóły
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
