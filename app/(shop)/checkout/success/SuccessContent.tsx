'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useCartStore } from '@/lib/store';

export default function SuccessContent() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-green-600">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">Zamówienie złożone!</h1>
      <p className="text-gray-600 text-lg mb-8">
        Dziękujemy za zakupy w WędkarskaFabryka3D. Potwierdzenie zamówienia zostanie wysłane na Twój adres email.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/products"
          className="inline-flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-4 rounded-xl transition-colors"
        >
          Kontynuuj zakupy
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 hover:border-blue-700 hover:text-blue-700 font-semibold px-8 py-4 rounded-xl transition-colors"
        >
          Strona główna
        </Link>
      </div>
    </div>
  );
}
