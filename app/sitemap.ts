import { prisma } from '@/lib/prisma'
import { getAllPosts } from '@/lib/blog'
import { publicProductWhere } from '@/lib/catalog'

export default async function sitemap() {
  let products: { id: string; updatedAt: Date }[] = []

  try {
    products = await prisma.product.findMany({
      where: publicProductWhere(),
      select: { id: true, updatedAt: true },
    })
  } catch {
    // Baza danych niedostępna podczas buildu
  }

  const blogPosts = getAllPosts()

  return [
    {
      url: 'https://treefish.pl',
      lastModified: new Date(),
    },
    {
      url: 'https://treefish.pl/products',
      lastModified: new Date(),
    },
    {
      url: 'https://treefish.pl/blog',
      lastModified: new Date(),
    },
    ...blogPosts.map((post) => ({
      url: `https://treefish.pl/blog/${post.slug}`,
      lastModified: new Date(),
    })),
    ...products.map((p) => ({
      url: `https://treefish.pl/products/${p.id}`,
      lastModified: p.updatedAt,
    })),
  ]
}
