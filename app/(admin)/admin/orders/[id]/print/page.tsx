import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PrintButton from '@/components/admin/PrintButton'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `Druk zamówienia ${id.slice(0, 8)}` }
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

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Oczekujące',
  PAID: 'Opłacone',
  SHIPPED: 'Wysłane',
  DELIVERED: 'Dostarczone',
  CANCELLED: 'Anulowane',
}

export default async function OrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) notFound()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside, .no-print, nav { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
          .min-h-screen { min-height: auto !important; }
          .flex { display: block !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}} />

      <div className="p-8 max-w-3xl mx-auto">
        <PrintButton />

        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              3D<span className="text-blue-500">Fish</span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">WędkarskaFabryka3D</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-800">Dokument zamówienia</h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                day: '2-digit', month: '2-digit', year: 'numeric',
              })}
            </p>
            <p className="text-sm text-gray-500">
              Status: {STATUS_LABELS[order.status] ?? order.status}
            </p>
          </div>
        </div>

        {/* Customer */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dane klienta</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900">{order.customerName}</p>
            <p className="text-sm text-gray-600">{order.customerEmail}</p>
          </div>
        </div>

        {/* Items table */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pozycje zamówienia</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-2 pr-4" style={{ width: '5%' }}>Lp.</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase py-2 pr-4">Produkt</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase py-2 pr-4">Cena jedn.</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase py-2 pr-4">Ilość</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase py-2">Suma</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 text-sm text-gray-500">{idx + 1}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.product.category}</p>
                  </td>
                  <td className="py-3 pr-4 text-right text-sm text-gray-700">{Number(item.price).toFixed(2)} PLN</td>
                  <td className="py-3 pr-4 text-right text-sm text-gray-700">{item.quantity} szt.</td>
                  <td className="py-3 text-right text-sm font-medium text-gray-900">{(Number(item.price) * item.quantity).toFixed(2)} PLN</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300">
                <td colSpan={4} className="py-3 text-right font-semibold text-gray-700">Razem:</td>
                <td className="py-3 text-right font-bold text-gray-900 text-lg">{Number(order.total).toFixed(2)} PLN</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Additional info */}
        <div className="mb-6 text-xs text-gray-400">
          <p>ID zamówienia: {order.id}</p>
          {order.stripeSessionId && <p>Stripe Session: {order.stripeSessionId}</p>}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          WędkarskaFabryka3D &mdash; Dokument wygenerowany automatycznie
        </div>
      </div>
    </>
  )
}
