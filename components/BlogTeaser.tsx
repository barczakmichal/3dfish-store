import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  title: string;
  slug: string;
  excerpt?: string;
  date?: string;
  coverImage?: string;
}

interface BlogTeaserProps {
  posts: BlogPost[];
}

export default function BlogTeaser({ posts }: BlogTeaserProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Z naszego bloga</h2>
          <Link href="/blog" className="text-orange-500 hover:text-orange-600 font-medium text-sm transition-colors">
            Wszystkie wpisy →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="relative aspect-video bg-blue-100">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-blue-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-5">
                {post.date && (
                  <p className="text-sm text-gray-400 mb-2">{post.date}</p>
                )}
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{post.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
