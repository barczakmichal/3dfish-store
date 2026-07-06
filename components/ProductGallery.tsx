"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  url: string;
  label?: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
  slug: string;
}

export default function ProductGallery({
  images,
  productName,
  slug,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayImages = images.length > 0 ? images : [{ url: `/images/products/${slug}.svg` }];
  const selectedImage = displayImages[selectedIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square bg-blue-50 rounded-2xl overflow-hidden">
        <Image
          key={selectedIndex}
          src={selectedImage.url}
          alt={`${productName} — zdjecie ${selectedIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={selectedIndex === 0}
        />
        {selectedImage.label && (
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {selectedImage.label}
          </span>
        )}
      </div>

      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              onClick={() => setSelectedIndex(i)}
              className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                i === selectedIndex
                  ? "border-blue-600 ring-2 ring-blue-600/30"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={img.url}
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
