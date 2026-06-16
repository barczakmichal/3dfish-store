import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — 3DFish | Druk 3D w wędkarstwie',
  description:
    'Artykuły o druku 3D w wędkarstwie, porównania sprzętu i poradniki. Dowiedz się, jak technologia zmienia akcesoria wędkarskie.',
  openGraph: {
    title: 'Blog — 3DFish',
    description: 'Artykuły o druku 3D w wędkarstwie',
    url: 'https://treefish.pl/blog',
    siteName: '3DFish',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog 3DFish</h1>
          <p className="text-blue-200 text-lg">
            Poradniki, porównania i nowości ze świata druku 3D w wędkarstwie
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-xl font-bold text-gray-900 hover:text-blue-700 transition-colors mb-2">
                  {post.title}
                </h2>
              </Link>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {post.metaDescription}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-blue-700 hover:text-blue-800 text-sm font-medium"
                >
                  Czytaj dalej &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
