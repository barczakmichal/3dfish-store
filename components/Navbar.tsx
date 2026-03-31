'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store';

function CartBadge() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || totalItems === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
      {totalItems > 99 ? '99+' : totalItems}
    </span>
  );
}

export default function Navbar() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-700 tracking-tight">
              3D<span className="text-orange-500">Fish</span>
            </span>
          </Link>

          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-700 font-medium transition-colors"
            >
              Strona główna
            </Link>
            <Link
              href="/products"
              className="text-gray-600 hover:text-blue-700 font-medium transition-colors"
            >
              Produkty
            </Link>
            <Link
              href="/blog"
              className="text-gray-600 hover:text-blue-700 font-medium transition-colors"
            >
              Blog
            </Link>
          </div>

          {/* Cart icon */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
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
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            <span className="text-sm font-medium">Koszyk</span>
            <CartBadge />
          </Link>

          {/* Mobile links */}
          <div className="md:hidden flex items-center gap-3">
            <Link href="/products" className="text-gray-600 hover:text-blue-700 font-medium text-sm">
              Sklep
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-blue-700 font-medium text-sm">
              Blog
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
