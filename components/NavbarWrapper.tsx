'use client';

import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('./Navbar'), {
  ssr: false,
  loading: () => (
    <header className="bg-white shadow-sm sticky top-0 z-50 h-16">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <span className="text-2xl font-bold text-blue-700 tracking-tight">
          tree<span className="text-orange-500">fish</span>
        </span>
      </nav>
    </header>
  ),
});

export default function NavbarWrapper() {
  return <Navbar />;
}
