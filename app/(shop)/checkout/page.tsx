'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

interface PickupPoint {
  code: string;
  name: string;
}

declare global {
  interface Window {
    Furgonetka?: {
      Map: new (options: {
        apiKey: string;
        courierServices: string[];
        callback: (params: { point: { code: string; name: string } }) => void;
      }) => { show: () => void };
    };
  }
}

const MAP_SCRIPT_URL = 'https://furgonetka.pl/js/dist/map/map.js';

function loadMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Furgonetka?.Map) return resolve();
    const existing = document.querySelector(`script[src="${MAP_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('map script failed')));
      return;
    }
    const script = document.createElement('script');
    script.src = MAP_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('map script failed'));
    document.head.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCartStore();
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupPoint, setPickupPoint] = useState<PickupPoint | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState<DiscountInfo | null>(null);

  useEffect(() => {
    const discountParam = searchParams.get('discount');
    if (discountParam) {
      fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountParam, orderAmount: getTotalPrice() }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => { if (data) setDiscount(data); });
    }
  }, [searchParams, getTotalPrice]);

  const openPointMap = async () => {
    setError('');
    setMapLoading(true);
    try {
      const res = await fetch('/api/furgonetka/map-key');
      const data = await res.json();
      if (!res.ok || !data.apiKey) {
        setError(data.error || 'Mapa punktów jest chwilowo niedostępna');
        return;
      }
      await loadMapScript();
      if (!window.Furgonetka?.Map) {
        setError('Nie udało się załadować mapy punktów');
        return;
      }
      new window.Furgonetka.Map({
        apiKey: data.apiKey,
        courierServices: ['inpost'],
        callback: ({ point }) => {
          setPickupPoint({ code: point.code, name: point.name });
        },
      }).show();
    } catch {
      setError('Nie udało się załadować mapy punktów');
    } finally {
      setMapLoading(false);
    }
  };

  const formatPln = (v: number) =>
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(v);
  const productsTotal = getTotalPrice();
  const discountAmount = discount ? calcDiscountAmount(discount, productsTotal) : 0;
  const formattedTotal = formatPln(productsTotal);
  const formattedShipping = formatPln(SHIPPING_COST_PLN);
  const formattedGrandTotal = formatPln(productsTotal - discountAmount + SHIPPING_COST_PLN);

  const handleCheckout = async () => {
    if (!name.trim()) {
      setError('Podaj imię i nazwisko');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Podaj poprawny adres email');
      return;
    }
    if (!phone.trim()) {
      setError('Podaj numer telefonu — dostaniesz SMS z kodem odbioru z paczkomatu');
      return;
    }
    if (!pickupPoint) {
      setError('Wybierz paczkomat InPost, do którego wyślemy zamówienie');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          customerEmail: email,
          customerName: name,
          customerPhone: phone.trim(),
          pickupPoint,
          discountCode: discount?.code || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Wystąpił błąd');
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Nie udało się połączyć z serwerem płatności');
      setLoading(false);
    }
  };

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Zamówienie</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+48 123 456 789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Na ten numer InPost wyśle SMS z kodem odbioru paczki.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Dostawa: Paczkomat InPost <span className="text-red-500">*</span>
            </h2>

            {pickupPoint ? (
              <div className="flex items-start justify-between gap-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div>
                  <p className="font-semibold text-gray-900">{pickupPoint.name}</p>
                  <p className="text-sm text-gray-600">Paczkomat: {pickupPoint.code}</p>
                </div>
                <button
                  type="button"
                  onClick={openPointMap}
                  className="text-sm text-blue-700 hover:text-blue-900 font-medium whitespace-nowrap"
                >
                  Zmień punkt
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openPointMap}
                disabled={mapLoading}
                className="w-full border-2 border-dashed border-blue-300 hover:border-blue-500 text-blue-700 font-semibold py-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {mapLoading ? 'Ładowanie mapy…' : '📍 Wybierz paczkomat na mapie'}
              </button>
            )}
          </div>
        </div>

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
                <span>
                  Dostawa{pickupPoint ? ` (Paczkomat ${pickupPoint.code})` : ' (Paczkomat InPost)'}
                </span>
                <span className="font-medium">{formattedShipping}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-3">
                <span>Razem</span>
                <span className="text-blue-700">{formattedGrandTotal}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                'Przekierowywanie do płatności...'
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
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                    />
                  </svg>
                  Przejdź do płatności
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-3 mt-4 text-xs text-gray-400">
              <span>Karta</span>
              <span>BLIK</span>
              <span>Przelewy24</span>
            </div>

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
  );
}
