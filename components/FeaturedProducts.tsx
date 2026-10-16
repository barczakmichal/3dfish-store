import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number | { toNumber: () => number };
  images: string[];
  category: string;
  slug: string;
  marketingImageUrl?: string | null;
  packshotImageUrl?: string | null;
}

interface FeaturedProductsProps {
  products: Product[];
  title: string;
  viewAllHref: string;
}

export default function FeaturedProducts({ products, title, viewAllHref }: FeaturedProductsProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Link href={viewAllHref} className="text-orange-500 hover:text-orange-600 font-medium text-sm transition-colors">
            Zobacz wszystkie →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => {
            const price = typeof product.price === 'object' ? product.price.toNumber() : product.price;
            const image = product.packshotImageUrl || product.marketingImageUrl || product.images[0] || '';
            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={price}
                image={image}
                category={product.category}
                slug={product.slug}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
