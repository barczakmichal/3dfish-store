import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://treefish.pl'

function resolveUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${APP_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

// Public Meta Product Catalog feed — JSON format compatible with Meta Catalog API.
// No auth required: product data is already publicly visible on the storefront.
export async function GET(_req: NextRequest) {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      category: true,
      slug: true,
      stock: true,
      marketingImageUrl: true,
      packshotImageUrl: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  const items = products.map((p) => {
    const imageUrl =
      resolveUrl(p.marketingImageUrl) || resolveUrl(p.packshotImageUrl)
    const availability = p.stock > 0 ? 'in stock' : 'out of stock'
    const price = `${Number(p.price).toFixed(2)} PLN`

    return {
      id: p.id,
      title: p.name,
      description: p.description.slice(0, 5000),
      availability,
      condition: 'new',
      price,
      link: `${APP_URL}/products/${p.slug}`,
      image_link: imageUrl,
      brand: 'Treefish',
      product_type: p.category,
    }
  })

  return NextResponse.json(items, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
