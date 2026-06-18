import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import OrderStatusSelect from '@/components/admin/OrderStatusSelect'

export const metadata = {
  title: 'Zamówienia - Panel Admina',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Oczekujące',
  PAID: 'Opłacone',
  SHIPPED: 'Wysłane',
  DELIVERED: 'Dostarczone',
  CANCELLED: 'Anulowane',
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

async function getOrders(statusFilter?: string) {
  try {
    const where = statusFilter && Object.values(OrderStatus).includes(statusFilter as OrderStatus)
      ? { status: statusFilter as OrderStatus }
      : {}
    return await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    })
  } catch {
    return []
  }
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams
  const orders = await getOrders(status)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zamówienia</h1>
          <p className="text-gray-600 mt-1">Zarządzaj zamówieniami klientów</p>
        </div>
      </div>

      {/* Filtr statusu */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <a
            href="/admin/orders"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !status ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Wszystkie ({orders.length})
          </a>
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
            <a
              key={s}
              href={`/admin/orders?status=${s}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {STATUS_LABELS[s]}
            </a>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg font-medium">Brak zamówień</p>
            <p className="text-sm mt-1">
              {status ? `Brak zamówień ze statusem "${STATUS_LABELS[status as OrderStatus]}"` : 'Nie złożono jeszcze żadnego zamówienia.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Klient</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Kwota</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Data</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Zmień status</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="block hover:text-orange-600">
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-500">{order.customerEmail}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {Number(order.total).toFixed(2)} PLN
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Szczegóły
                    </Link>
                    <Link
                      href={`/admin/orders/${order.id}/print`}
                      target="_blank"
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      Drukuj
                    </Link>
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
