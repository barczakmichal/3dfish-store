import Image from 'next/image';
import Link from 'next/link';

interface Category {
  name: string;
  count: number;
  imageUrl: string;
  slug: string;
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Odkryj nasze kategorie</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group rounded-xl overflow-hidden relative aspect-[4/3] block"
            >
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-semibold text-sm sm:text-base leading-tight">{category.name}</p>
                <p className="text-white/80 text-xs mt-0.5">{category.count} produktów</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
