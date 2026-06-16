import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import AddToCartButton from './AddToCartButton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  let product = null;
  try {
    product = await prisma.product.findUnique({ where: { slug } });
  } catch {
    // Baza danych niedostępna
  }

  if (!product) {
    return { title: 'Produkt nie znaleziony | 3DFish' };
  }

  return {
    title: `${product.name} | 3DFish`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | 3DFish`,
      description: product.description.slice(0, 160),
      url: `https://treefish.pl/products/${product.slug}`,
      siteName: '3DFish',
      locale: 'pl_PL',
      type: 'website',
      ...(product.images[0] ? { images: [{ url: product.images[0] }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product = null;
  try {
    product = await prisma.product.findUnique({ where: { slug } });
  } catch {
    // Baza danych niedostępna
  }

  if (!product) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(Number(product.price));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-700">Strona główna</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-blue-700">Produkty</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product image */}
        <div className="aspect-square bg-blue-50 rounded-2xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-32 h-32 text-blue-200">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75 7.5 9l4.5 4.5 3-3.75 4.5 5.25H2.25Z" />
          </svg>
        </div>

        {/* Product details */}
        <div>
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="text-4xl font-bold text-blue-700 mb-6">{formattedPrice}</div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600">
              {product.stock > 0 ? `Dostępny (${product.stock} szt.)` : 'Brak w magazynie'}
            </span>
          </div>

          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              price: Number(product.price),
              slug: product.slug,
              image: product.images[0] || '',
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  );
}
