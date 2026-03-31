import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'

export const metadata = {
  title: 'Dashboard - Panel Admina WędkarskaFabryka3D',
}

async function getDashboardData() {
  try {
    const [productCount, orderCount, paidOrders, recentOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: 'PAID' },
        select: { total: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0)

    return { productCount, orderCount, revenue, recentOrders }
  } catch {
    return { productCount: 0, orderCount: 0, revenue: 0, recentOrders: [] }
  }
}

export default async function AdminDashboard() {
  const { productCount, orderCount, revenue, recentOrders } = await getDashboardData()

  const stats = [
    { label: 'Produkty', value: productCount.toString(), description: 'W katalogu', color: 'text-blue-700', href: '/admin/products' },
    { label: 'Zamówienia', value: orderCount.toString(), description: 'Łącznie', color: 'text-green-700', href: '/admin/orders' },
    { label: 'Przychód', value: `${revenue.toFixed(2)} PLN`, description: 'Ze statusu Opłacone', color: 'text-orange-700', href: '/admin/orders?status=PAID' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Witaj w panelu administracyjnym WędkarskaFabryka3D</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="block">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Szybkie akcje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 border border-orange-200 bg-orange-50 hover:bg-orange-100 rounded-lg p-4 transition-colors"
          >
            <div>
              <p className="font-medium text-orange-800">+ Dodaj nowy produkt</p>
              <p className="text-sm text-orange-600 mt-0.5">Uzupełnij katalog sklepu</p>
            </div>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg p-4 transition-colors"
          >
            <div>
              <p className="font-medium text-blue-800">Zarządzaj zamówieniami</p>
              <p className="text-sm text-blue-600 mt-0.5">Zmień statusy, przeglądaj historię</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ostatnie zamówienia</h2>
          <Link href="/admin/orders" className="text-sm text-orange-600 hover:text-orange-800 font-medium">
            Zobacz wszystkie
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">Brak zamówień do wyświetlenia.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                  <p className="text-sm text-gray-500">{order.customerEmail}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{Number(order.total).toFixed(2)} PLN</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
