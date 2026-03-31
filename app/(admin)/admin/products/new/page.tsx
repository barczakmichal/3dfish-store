import Link from 'next/link'
import ProductForm from '@/components/admin/ProductForm'

export const metadata = {
  title: 'Nowy produkt - Panel Admina',
}

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
          ← Powrót do produktów
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nowy produkt</h1>
        <p className="text-gray-600 mt-1">Wypełnij formularz, aby dodać nowy produkt do sklepu.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <ProductForm mode="new" />
      </div>
    </div>
  )
}
