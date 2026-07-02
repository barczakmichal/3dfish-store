'use client';

import Script from 'next/script';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';

declare global {
  interface Window {
    Furgonetka?: {
      Checkout: {
        init: (config: FurgonetkaCheckoutConfig) => void;
      };
    };
  }
}

interface FurgonetkaCheckoutConfig {
  dataProviderCallback: () => Promise<unknown>;
  eventsCallback: (event: FurgonetkaEvent) => void;
}

interface FurgonetkaEvent {
  type: string;
  data?: { order_id?: string };
}

const FURGONETKA_ENV = process.env.NEXT_PUBLIC_FURGONETKA_ENV || 'sandbox';
const FURGONETKA_SCRIPT_SRC =
  FURGONETKA_ENV === 'production'
    ? 'https://cdn.furgonetka.pl/checkout/universal-checkout-prod.js'
    : 'https://cdn.furgonetka.pl/checkout/universal-checkout-sandbox.js';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(false);

  const formattedTotal = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(getTotalPrice());

  const handleOpenWidget = useCallback(() => {
    if (!name.trim()) {
      setError('Podaj imię i nazwisko');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Podaj poprawny adres email');
      return;
    }
    setError('');

    if (!window.Furgonetka) {
      setError('Widget Furgonetki nie jest jeszcze gotowy. Odczekaj chwilę i spróbuj ponownie.');
      return;
    }

    setWidgetOpen(true);

    window.Furgonetka.Checkout.init({
      dataProviderCallback: async () => {
        const res = await fetch('/api/furgonetka/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          }),
        });
        if (!res.ok) {
          throw new Error('Nie udało się pobrać danych koszyka');
        }
        const cartData = await res.json();
        return {
          ...cartData,
          customer: {
            name,
            email,
            phone: phone.trim() || undefined,
          },
        };
      },
      eventsCallback: (event: FurgonetkaEvent) => {
        if (event.type === 'ORDER_CREATED') {
          clearCart();
          router.push('/checkout/success');
        }
        if (event.type === 'CLOSE') {
          setWidgetOpen(false);
        }
      },
    });
  }, [name, email, phone, items, clearCart, router]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 text-blue-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Koszyk jest pusty</h1>
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
    <>
      <Script
        src={FURGONETKA_SCRIPT_SRC}
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Zamówienie</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer info form */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Dane kontaktowe</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Imię i nazwisko <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jan Kowalski"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Adres email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.pl"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon{' '}
                    <span className="text-gray-400 font-normal">(opcjonalnie)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+48 123 456 789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Dane adresowe i wybór dostawy uzupełnisz w kolejnym kroku.
              </p>
            </div>
          </div>

          {/* Order summary + checkout button */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Podsumowanie zamówienia</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 flex-1 mr-4 truncate">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium flex-shrink-0">
                      {new Intl.NumberFormat('pl-PL', {
                        style: 'currency',
                        currency: 'PLN',
                      }).format(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Dostawa</span>
                  <span className="text-blue-600 font-medium">wg cennika kuriera</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-3">
                  <span>Produkty razem</span>
                  <span className="text-blue-700">{formattedTotal}</span>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <button
                onClick={handleOpenWidget}
                disabled={widgetOpen}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
              >
                {widgetOpen ? (
                  'Trwa ładowanie wyboru dostawy...'
                ) : !scriptLoaded ? (
                  'Ładowanie...'
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                      />
                    </svg>
                    Wybierz dostawę i zapłać
                  </>
                )}
              </button>

              <Link
                href="/cart"
                className="block w-full text-center text-gray-500 hover:text-blue-700 text-sm mt-4 transition-colors"
              >
                ← Wróć do koszyka
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
