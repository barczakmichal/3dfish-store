import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand + socials */}
          <div>
            <h3 className="text-xl font-bold mb-3">
              tree<span className="text-orange-500">fish</span>
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Najlepsze akcesoria wędkarskie drukowane w technologii 3D.
              Jakość i precyzja w każdym produkcie.
            </p>
            {/* Social media icons */}
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069Zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg mb-3">Sklep</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Wszystkie produkty
                </Link>
              </li>
              <li>
                <Link href="/products?category=Organizery%20i%20skrzynki" className="hover:text-white transition-colors">
                  Organizacja i przechowywanie
                </Link>
              </li>
              <li>
                <Link href="/products?category=Lurki%20i%20przynęty" className="hover:text-white transition-colors">
                  Lury i przynęty
                </Link>
              </li>
              <li>
                <Link href="/products?category=Akcesoria%20drobne" className="hover:text-white transition-colors">
                  Akcesoria
                </Link>
              </li>
            </ul>
          </div>

          {/* Blog */}
          <div>
            <h4 className="font-semibold text-lg mb-3">Blog</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/blog/druk-3d-w-wedkarstwie" className="hover:text-white transition-colors">
                  Druk 3D w wędkarstwie
                </Link>
              </li>
              <li>
                <Link href="/blog/porownanie-uchwytow-na-wedki" className="hover:text-white transition-colors">
                  Porównanie uchwytów na wędki
                </Link>
              </li>
              <li>
                <Link href="/blog/diy-vs-gotowe-akcesoria-wedkarskie" className="hover:text-white transition-colors">
                  DIY vs gotowe akcesoria
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact + payments */}
          <div>
            <h4 className="font-semibold text-lg mb-3">Kontakt</h4>
            <ul className="space-y-2 text-gray-400 text-sm mb-4">
              <li>kontakt@treefish.pl</li>
              <li>Pon-Pt: 9:00 - 17:00</li>
            </ul>
            {/* Payment icons */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-gray-400 border border-gray-600 rounded px-2 py-0.5">BLIK</span>
              <span className="text-xs text-gray-400 border border-gray-600 rounded px-2 py-0.5">Visa</span>
              <span className="text-xs text-gray-400 border border-gray-600 rounded px-2 py-0.5">Mastercard</span>
              <span className="text-xs text-gray-400 border border-gray-600 rounded px-2 py-0.5">Klarna</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm space-y-2">
          <p>&copy; 2026 treefish. Wszelkie prawa zastrzeżone.</p>
          <div className="flex justify-center items-center gap-2">
            <Link href="/regulamin" className="hover:text-gray-300 transition-colors">
              Regulamin
            </Link>
            <span>|</span>
            <Link href="/polityka-prywatnosci" className="hover:text-gray-300 transition-colors">
              Polityka Prywatności
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
