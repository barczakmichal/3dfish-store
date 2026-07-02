"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-blue-50 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-32 h-32 text-blue-200"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75 7.5 9l4.5 4.5 3-3.75 4.5 5.25H2.25Z"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square bg-blue-50 rounded-2xl overflow-hidden">
        <Image
          key={selectedIndex}
          src={images[selectedIndex]}
          alt={`${productName} — zdjęcie ${selectedIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={selectedIndex === 0}
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                i === selectedIndex
                  ? "border-blue-600 ring-2 ring-blue-600/30"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} — miniaturka ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
