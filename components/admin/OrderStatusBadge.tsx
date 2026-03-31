import { OrderStatus } from '@prisma/client'

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Oczekujące', className: 'bg-yellow-100 text-yellow-700' },
  PAID: { label: 'Opłacone', className: 'bg-blue-100 text-blue-700' },
  SHIPPED: { label: 'Wysłane', className: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Dostarczone', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Anulowane', className: 'bg-red-100 text-red-700' },
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
