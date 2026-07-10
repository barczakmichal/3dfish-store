'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { SHIPPING_COST_PLN } from '@/lib/shipping';
import DiscountCodeInput from '@/components/shop/DiscountCodeInput';

interface DiscountInfo {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderAmount: number | null;
}

function calcDiscountAmount(discount: DiscountInfo, productsTotal: number): number {
  if (discount.type === 'PERCENTAGE') {
    return Math.round(productsTotal * discount.value) / 100;
  }
  return Math.min(discount.value, productsTotal);
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [discount, setDiscount] = useState<DiscountInfo | null>(null);

  const formatPln = (v: number) =>
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v);
  const productsTotal = getTotalPrice();
  const discountAmount = discount ? calcDiscountAmount(discount, productsTotal) : 0;
  const formattedTotal = formatPln(productsTotal);
  const formattedShipping = formatPln(SHIPPING_COST_PLN);
  const formattedGrandTotal = formatPln(productsTotal - discountAmount + SHIPPING_COST_PLN);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Twój koszyk jest pusty</h1>
        <p className="text-gray-600 mb-8">Dodaj produkty do koszyka, aby kontynuować zakupy.</p>
        <Link
          href="/products"
          className="inline-flex items-center bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl hover:bg-blue-800 transition-colors"
        >
          Przeglądaj produkty
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Koszyk</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-200">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75 7.5 9l4.5 4.5 3-3.75 4.5 5.25H2.25Z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`} className="font-semibold text-gray-900 hover:text-blue-700 transition-colors line-clamp-2">
                  {item.name}
                </Link>
                <p className="text-blue-700 font-bold mt-1">
                  {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(item.price)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors font-bold"
                >
                  +
                </button>
              </div>

              <div className="text-right min-w-16">
                <p className="font-bold text-gray-900">
                  {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(item.price * item.quantity)}
                </p>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Podsumowanie zamówienia</h2>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} x{item.quantity}</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <DiscountCodeInput
                orderAmount={productsTotal}
                onApply={setDiscount}
                onRemove={() => setDiscount(null)}
                appliedDiscount={discount}
              />
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Produkty</span>
                <span className="font-medium">{formattedTotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600 mb-2">
                  <span>Rabat ({discount!.code})</span>
                  <span className="font-medium">-{formatPln(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Dostawa (Paczkomat InPost)</span>
                <span className="font-medium">{formattedShipping}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-3">
                <span>Razem</span>
                <span className="text-blue-700">{formattedGrandTotal}</span>
              </div>
            </div>

            <Link
              href={discount ? `/checkout?discount=${encodeURIComponent(discount.code)}` : '/checkout'}
              className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
            >
              Przejdź do kasy
            </Link>

            <Link
              href="/products"
              className="block w-full text-center text-gray-600 hover:text-blue-700 text-sm mt-4 transition-colors"
            >
              Kontynuuj zakupy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
