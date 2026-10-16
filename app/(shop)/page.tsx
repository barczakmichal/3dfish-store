import type { Metadata } from 'next';
import { connection } from 'next/server';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { publicProductWhere } from '@/lib/catalog';
import { getAllPosts } from '@/lib/blog';
import TrustBar from '@/components/TrustBar';
import CategoryGrid from '@/components/CategoryGrid';
import FeaturedProducts from '@/components/FeaturedProducts';
import AboutSection from '@/components/AboutSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import BlogTeaser from '@/components/BlogTeaser';
import NewsletterSection from '@/components/NewsletterSection';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'treefish - Akcesoria wędkarskie drukowane w 3D',
  description:
    'Sklep z unikalnymi akcesoriami wędkarskimi drukowanymi w technologii 3D. Spławiki, haczyki, pudełka, kółka i wiele więcej – precyzja i jakość w każdym detalu.',
  openGraph: {
    title: 'treefish',
    description: 'Unikalne akcesoria wędkarskie drukowane w 3D',
    url: 'https://treefish.pl',
    siteName: 'treefish',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default async function HomePage() {
  await connection();

  let featuredProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let categoryData: { category: string; _count: { category: number } }[] = [];

  try {
    [featuredProducts, categoryData] = await Promise.all([
      prisma.product.findMany({
        where: { AND: [{ stock: { gt: 0 } }, publicProductWhere()] },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.product.groupBy({
        by: ['category'],
        where: { AND: [{ stock: { gt: 0 } }, publicProductWhere()] },
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
      }),
    ]);
  } catch {
    // DB unavailable
  }

  const categories = categoryData.map((c) => ({
    name: c.category,
    count: c._count.category,
    imageUrl: '',
    slug: c.category,
  }));

  const blogPosts = getAllPosts().slice(0, 3);

  return (
    <div>
      {/* Hero Section v2 */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            {/* Left col-span-3 */}
            <div className="md:col-span-3">
              <span className="inline-block bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full mb-6">
                Technologia 3D w wędkarstwie
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Akcesoria wędkarskie{' '}
                <span className="text-orange-400">nowej generacji</span>
              </h1>
              <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                Odkryj unikalne akcesoria wędkarskie drukowane w technologii 3D.
                Precyzja i jakość, które wytrzymają każde warunki —{' '}
                <strong className="text-white">made in Poland</strong>, wysyłka w 24h, 30 dni na zwrot.
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
                <a
                  href="#about"
                  className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
                >
                  Jak to działa?
                </a>
              </div>
            </div>

            {/* Right col-span-2: product image, hidden on mobile */}
            <div className="hidden md:flex md:col-span-2 justify-center items-center">
              <div className="relative">
                <Image
                  src="/products/01-reel-stand.png"
                  alt="Produkt treefish"
                  width={400}
                  height={400}
                  className="object-contain max-w-md drop-shadow-2xl rotate-3"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TrustBar */}
      <TrustBar />

      {/* CategoryGrid */}
      {categories.length > 0 && (
        <CategoryGrid categories={categories} />
      )}

      {/* FeaturedProducts — Bestsellery */}
      <FeaturedProducts
        products={featuredProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          images: p.images,
          category: p.category,
          slug: p.slug,
          marketingImageUrl: p.marketingImageUrl,
          packshotImageUrl: p.packshotImageUrl,
        }))}
        title="Bestsellery"
        viewAllHref="/products"
      />

      {/* AboutSection */}
      <div id="about">
        <AboutSection />
      </div>

      {/* TestimonialsSection */}
      <TestimonialsSection />

      {/* BlogTeaser */}
      {blogPosts.length > 0 && (
        <BlogTeaser posts={blogPosts} />
      )}

      {/* NewsletterSection */}
      <NewsletterSection />
    </div>
  );
}
