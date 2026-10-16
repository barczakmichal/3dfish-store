import { prisma } from '@/lib/prisma'
import StockEditor from '@/components/admin/StockEditor'

export const metadata = {
  title: 'Magazyn - Panel Admina',
}

export const dynamic = 'force-dynamic'

async function getProducts() {
  try {
    return await prisma.product.findMany({
      orderBy: [{ stock: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, category: true, stock: true, price: true, slug: true },
    })
  } catch {
    return []
  }
}

export default async function StockPage() {
  const products = await getProducts()

  const outOfStock = products.filter(p => p.stock === 0)
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 5)
  const inStock = products.filter(p => p.stock >= 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Magazyn</h1>
        <p className="text-gray-600 mt-1">Zarządzaj stanami magazynowymi produktów</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
          <p className="text-sm font-medium text-gray-500">Brak w magazynie</p>
          <p className="text-3xl font-bold text-red-700 mt-1">{outOfStock.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
          <p className="text-sm font-medium text-gray-500">Niski stan (&lt;5 szt.)</p>
          <p className="text-3xl font-bold text-yellow-700 mt-1">{lowStock.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">Dostępne</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{inStock.length}</p>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium">Brak produktów</p>
            <p className="text-sm mt-1">Dodaj produkty, aby zarządzać stanami magazynowymi.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Produkt</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Kategoria</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Cena</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Stan magazynowy</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Szybka edycja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${product.stock === 0 ? 'bg-red-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{product.name}</p>
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
                  <td className="px-6 py-4 text-right">
                    <StockEditor productId={product.id} currentStock={product.stock} />
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
