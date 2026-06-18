import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import OrderStatusSelect from '@/components/admin/OrderStatusSelect'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `Zamówienie ${id.slice(0, 8)} - Panel Admina` }
}

async function getOrder(id: string) {
  try {
    return await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    })
  } catch {
    return null
  }
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) notFound()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/orders" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Zamówienie</h1>
          </div>
          <p className="text-gray-500 font-mono text-sm">{order.id}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/orders/${order.id}/print`}
            target="_blank"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12Zm-3 0h.008v.008h-.008V12Z" />
            </svg>
            Drukuj
          </Link>
          <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Pozycje zamówienia</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Produkt</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Cena jedn.</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Ilość</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Suma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-500">{item.product.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {Number(item.price).toFixed(2)} PLN
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {item.quantity} szt.
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {(Number(item.price) * item.quantity).toFixed(2)} PLN
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-semibold text-gray-700">
                    Razem:
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 text-lg">
                    {Number(order.total).toFixed(2)} PLN
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Status</h3>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Dane klienta</h3>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{order.customerName}</p>
              <a
                href={`mailto:${order.customerEmail}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {order.customerEmail}
              </a>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Szczegóły</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Data złożenia</span>
                <span className="text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pozycji</span>
                <span className="text-gray-900">{order.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Łączna ilość</span>
                <span className="text-gray-900">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} szt.
                </span>
              </div>
              {order.stripeSessionId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Stripe ID</span>
                  <span className="text-gray-900 font-mono text-xs truncate max-w-[160px]">
                    {order.stripeSessionId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
