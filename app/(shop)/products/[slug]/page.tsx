import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import AddToCartButton from './AddToCartButton';
import ProductGallery from '@/components/ProductGallery';
import { publicProductWhere } from '@/lib/catalog';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  let product = null;
  try {
    product = await prisma.product.findFirst({ where: { AND: [{ slug }, publicProductWhere()] } });
  } catch {
    // Baza danych niedostępna
  }

  if (!product) {
    return { title: 'Produkt nie znaleziony | treefish' };
  }

  const ogImage = product.marketingImageUrl ?? product.images[0];

  return {
    title: `${product.name} | treefish`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | treefish`,
      description: product.description.slice(0, 160),
      url: `https://treefish.pl/products/${product.slug}`,
      siteName: 'treefish',
      locale: 'pl_PL',
      type: 'website',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product = null;
  try {
    product = await prisma.product.findFirst({ where: { AND: [{ slug }, publicProductWhere()] } });
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

  const galleryImages = [
    product.marketingImageUrl ? { url: product.marketingImageUrl, label: 'Zdjęcie reklamowe' } : null,
    product.packshotImageUrl ? { url: product.packshotImageUrl, label: 'Packshot' } : null,
    product.printedImageUrl ? { url: product.printedImageUrl, label: 'Przykładowy wydruk' } : null,
    ...product.images.map((url) => ({ url })),
  ].filter((x): x is { url: string; label?: string } => x !== null)
  const seen = new Set<string>()
  const dedupedImages = galleryImages.filter((img) => (seen.has(img.url) ? false : (seen.add(img.url), true)))

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
        {/* Product gallery */}
        <ProductGallery images={dedupedImages} productName={product.name} slug={product.slug} />

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
              image: product.marketingImageUrl ?? product.images[0] ?? `/images/products/${product.slug}.svg`,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  );
}
