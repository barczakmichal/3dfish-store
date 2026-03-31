import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/blog';

type Props = {
  params: Promise<{ slug: string }>;
};

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
    .replace(
      /\|(.+)\|/g,
      (match) => `<div class="overflow-x-auto my-6"><table class="min-w-full text-sm border border-gray-200 rounded">${match}</table></div>`
    );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="text-blue-300 hover:text-white text-sm mb-4 inline-block"
          >
            &larr; Powrót do bloga
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold bg-blue-700 text-blue-200 px-3 py-1 rounded-full">
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {post.title}
          </h1>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-10 [&>h2]:mb-4 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>table]:w-full [&>table]:border-collapse [&>table]:my-6 [&>th]:bg-gray-100 [&>th]:p-2 [&>th]:text-left [&>td]:p-2 [&>td]:border-t [&>td]:border-gray-200"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-200">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sprawdź nasze produkty
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Wszystkie akcesoria wędkarskie z artykułu znajdziesz w naszym sklepie.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center bg-blue-700 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Przeglądaj produkty
          </Link>
        </div>
      </article>
    </div>
  );
}
