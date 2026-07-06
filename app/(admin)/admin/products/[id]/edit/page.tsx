import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductForm from '@/components/admin/ProductForm'

export const metadata = {
  title: 'Edycja produktu - Panel Admina',
}

interface Props {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  try {
    return await prisma.product.findUnique({ where: { id } })
  } catch {
    return null
  }
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
          ← Powrót do produktów
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edytuj produkt</h1>
        <p className="text-gray-600 mt-1">{product.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <ProductForm
          mode="edit"
          initialData={{
            id: product.id,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            images: product.images,
            stock: product.stock,
            category: product.category,
            slug: product.slug,
            sourceUrl: product.sourceUrl,
            sourceFileUrl: product.sourceFileUrl,
            printedImageUrl: product.printedImageUrl,
            marketingImageUrl: product.marketingImageUrl,
            packshotImageUrl: product.packshotImageUrl,
            licenseType: product.licenseType,
            commercialUseOverride: product.commercialUseOverride,
          }}
        />
      </div>
    </div>
  )
}
