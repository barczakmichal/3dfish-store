import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: '3DFish - Akcesoria wędkarskie drukowane w 3D',
  description:
    'Sklep z unikalnymi akcesoriami wędkarskimi drukowanymi w technologii 3D. Spławiki, haczyki, pudełka, kółka i wiele więcej – precyzja i jakość w każdym detalu.',
  openGraph: {
    title: '3DFish',
    description: 'Unikalne akcesoria wędkarskie drukowane w 3D',
    url: 'https://3dfish.pl',
    siteName: '3DFish',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default async function HomePage() {
  let featuredProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];

  try {
    featuredProducts = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
  } catch {
    // Baza danych niedostępna
  }

  return (
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-block bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full mb-6">
              Technologia 3D w wędkarstwie
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Akcesoria wędkarskie{' '}
              <span className="text-orange-400">nowej generacji</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Odkryj wyjątkowe akcesoria wędkarskie drukowane w technologii 3D.
              Precyzja, jakość i innowacja w każdym produkcie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
              >
                Przeglądaj produkty
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 ml-2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
              >
                Nowości
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Najwyższa jakość</h3>
              <p className="text-gray-600 text-sm">Każdy produkt drukowany z najlepszych materiałów w technologii FDM/SLA.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-orange-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Szybka dostawa</h3>
              <p className="text-gray-600 text-sm">Zamówienia wysyłamy w ciągu 24 godzin. Dostawa kurierem na terenie całej Polski.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">30 dni na zwrot</h3>
              <p className="text-gray-600 text-sm">Nie jesteś zadowolony? Zwróć produkt w ciągu 30 dni bez podania przyczyny.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Najnowsze produkty</h2>
              <p className="text-gray-600 mt-2">Odkryj nasze najpopularniejsze akcesoria wędkarskie</p>
            </div>
            <Link
              href="/products"
              className="hidden md:inline-flex items-center text-blue-700 hover:text-blue-800 font-medium"
            >
              Zobacz wszystkie
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={Number(product.price)}
                image={product.images[0] || ''}
                category={product.category}
                slug={product.slug}
              />
            ))}
          </div>

          <div className="text-center mt-10 md:hidden">
            <Link
              href="/products"
              className="inline-flex items-center bg-blue-700 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Zobacz wszystkie produkty
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Gotowy na nowe wędkarskie przygody?</h2>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            Dołącz do tysięcy zadowolonych wędkarzy, którzy wybrali nasze produkty 3D.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
          >
            Zacznij zakupy
          </Link>
        </div>
      </section>
    </div>
  );
}
