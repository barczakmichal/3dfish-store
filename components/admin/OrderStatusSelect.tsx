'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrderStatus } from '@prisma/client'

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Oczekujące',
  PAID: 'Opłacone',
  SHIPPED: 'Wysłane',
  DELIVERED: 'Dostarczone',
  CANCELLED: 'Anulowane',
}

interface Props {
  orderId: string
  currentStatus: OrderStatus
}

export default function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleChange(newStatus: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Błąd podczas zmiany statusu.')
      }
    } catch {
      alert('Błąd połączenia z serwerem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      defaultValue={currentStatus}
      disabled={loading}
      onChange={e => handleChange(e.target.value)}
      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
    >
      {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  )
}
