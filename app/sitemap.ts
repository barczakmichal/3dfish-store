import { prisma } from '@/lib/prisma'

export default async function sitemap() {
  let products: { id: string; updatedAt: Date }[] = []

  try {
    products = await prisma.product.findMany({
      select: { id: true, updatedAt: true },
    })
  } catch {
    // Baza danych niedostępna podczas buildu
  }

  return [
    {
      url: 'https://3dfish.pl',
      lastModified: new Date(),
    },
    {
      url: 'https://3dfish.pl/products',
      lastModified: new Date(),
    },
    ...products.map((p) => ({
      url: `https://3dfish.pl/products/${p.id}`,
      lastModified: p.updatedAt,
    })),
  ]
}
