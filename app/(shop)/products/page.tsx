import type { Metadata } from 'next';
import ProductCard from '@/components/ProductCard';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Produkty | treefish',
  description:
    'Katalog akcesoriów wędkarskich drukowanych w technologii 3D – spławiki, haczyki, pudełka, kółka i więcej. Sprawdź naszą ofertę.',
  openGraph: {
    title: 'Produkty | treefish',
    description: 'Akcesoria wędkarskie drukowane w technologii 3D',
    url: 'https://treefish.pl/products',
    siteName: 'treefish',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];

  try {
    products = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    // Baza danych niedostępna
  }

  const categories = [
    'Wszystkie',
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wszystkie produkty</h1>
        <p className="text-gray-600 mt-2">
          Odkryj naszą pełną kolekcję akcesoriów wędkarskich drukowanych w 3D
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              cat === 'Wszystkie'
                ? 'bg-blue-700 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-700 hover:text-blue-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
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

      {/* Empty state */}
      {products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Brak produktów w tej kategorii.</p>
        </div>
      )}
    </div>
  );
}
