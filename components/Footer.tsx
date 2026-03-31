import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-3">
              WedkarskaFabryka<span className="text-orange-500">3D</span>
            </h3>
            <p className="text-gray-400 text-sm">
              Najlepsze akcesoria wędkarskie drukowane w technologii 3D.
              Jakość i precyzja w każdym produkcie.
            </p>
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
                <Link href="/products?category=kolowrotki" className="hover:text-white transition-colors">
                  Kołowrotki
                </Link>
              </li>
              <li>
                <Link href="/products?category=wedki" className="hover:text-white transition-colors">
                  Wędki
                </Link>
              </li>
              <li>
                <Link href="/products?category=splawiki" className="hover:text-white transition-colors">
                  Spławiki
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-3">Kontakt</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>kontakt@wedkarskafarryka3d.pl</li>
              <li>+48 123 456 789</li>
              <li>Pon-Pt: 9:00 - 17:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} WędkarskaFabryka3D. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}
