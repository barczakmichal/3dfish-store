'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { trackPurchase } from '@/lib/meta-pixel';
import { Suspense } from 'react';

function OrderSuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const { items, clearCart, getTotalPrice } = useCartStore();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && items.length > 0) {
      trackedRef.current = true;
      trackPurchase({
        value: getTotalPrice(),
        orderId: orderId || sessionId || 'unknown',
        contentIds: items.map((i) => i.id),
        numItems: items.reduce((sum, i) => sum + i.quantity, 0),
      });
    }
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-10 h-10 text-green-600"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">Zamówienie zostało złożone!</h1>
      <p className="text-gray-600 text-lg mb-4">
        Dziękujemy za zakupy w treefish. Potwierdzenie zamówienia zostanie wysłane na
        Twój adres email.
      </p>

      {sessionId && (
        <p className="text-sm text-gray-400 mb-8">
          Numer sesji: <span className="font-mono">{sessionId}</span>
        </p>
      )}

      <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
        <h2 className="font-semibold text-gray-900 mb-3">Co dalej?</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold mt-0.5">✓</span>
            Wyślemy Ci email z potwierdzeniem zamówienia
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold mt-0.5">✓</span>
            Zamówienie zostanie przygotowane w ciągu 1-2 dni roboczych
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold mt-0.5">✓</span>
            Dostarczymy przesyłkę kurierem na wskazany adres
          </li>
        </ul>
      </div>

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

export default function OrderSuccessContent() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      }
    >
      <OrderSuccessInner />
    </Suspense>
  );
}
