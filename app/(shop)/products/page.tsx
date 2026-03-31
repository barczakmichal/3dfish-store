import ProductCard from '@/components/ProductCard';

// Przykładowe produkty (będą pobierane z bazy danych po konfiguracji)
const allProducts = [
  {
    id: '1',
    name: 'Kołowrotek SpinMaster 3D',
    price: 129.99,
    image: '',
    category: 'Kołowrotki',
    slug: 'kolowrotek-spinmaster-3d',
  },
  {
    id: '2',
    name: 'Spławik UltraFloat Pro',
    price: 24.99,
    image: '',
    category: 'Spławiki',
    slug: 'splawik-ultrafloat-pro',
  },
  {
    id: '3',
    name: 'Przypona Fluorocarbon 3D',
    price: 39.99,
    image: '',
    category: 'Przypony',
    slug: 'przypona-fluorocarbon-3d',
  },
  {
    id: '4',
    name: 'Haczyk SteelHook 3D Pack',
    price: 19.99,
    image: '',
    category: 'Haczyki',
    slug: 'haczyk-steelhook-3d-pack',
  },
  {
    id: '5',
    name: 'Zanęta PelletMix 3D',
    price: 34.99,
    image: '',
    category: 'Zanęty',
    slug: 'zaneta-pelletmix-3d',
  },
  {
    id: '6',
    name: 'Wędka CarbonPro 3D',
    price: 299.99,
    image: '',
    category: 'Wędki',
    slug: 'wedka-carbonpro-3d',
  },
];

const categories = ['Wszystkie', 'Kołowrotki', 'Wędki', 'Spławiki', 'Haczyki', 'Przypony', 'Zanęty'];

export const metadata = {
  title: 'Produkty - WędkarskaFabryka3D',
  description: 'Katalog akcesoriów wędkarskich drukowanych w technologii 3D.',
};

export default function ProductsPage() {
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
        {allProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* Empty state */}
      {allProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Brak produktów w tej kategorii.</p>
        </div>
      )}
    </div>
  );
}
