'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store';

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    slug: string;
    image: string;
    stock: number;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      slug: product.slug,
    });
  };

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-colors text-lg mb-4"
      >
        {product.stock > 0 ? 'Dodaj do koszyka' : 'Brak w magazynie'}
      </button>

      <Link
        href="/cart"
        className="block w-full text-center border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold py-4 px-8 rounded-xl transition-colors text-lg"
      >
        Przejdź do koszyka
      </Link>
    </>
  );
}
