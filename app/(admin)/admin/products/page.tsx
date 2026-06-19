import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import DeleteProductButton from '@/components/admin/DeleteProductButton'

export const metadata = {
  title: 'Produkty - Panel Admina',
}

async function getProducts() {
  try {
    return await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  } catch {
    return []
  }
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produkty</h1>
          <p className="text-gray-600 mt-1">Zarządzaj katalogiem produktów</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          + Dodaj produkt
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium">Brak produktów</p>
            <p className="text-sm mt-1">Dodaj pierwszy produkt, aby zacząć sprzedawać.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Nazwa</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Kategoria</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Cena</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Stan magazynowy</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                        {product.sourceUrl && (
                          <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200" title="Ma plik źródłowy do druku">
                            3D
                          </a>
                        )}
                      </p>
                      <p className="text-sm text-gray-400 truncate max-w-xs">{product.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {Number(product.price).toFixed(2)} PLN
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock === 0
                        ? 'bg-red-100 text-red-700'
                        : product.stock < 5
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {product.stock} szt.
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edytuj
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
