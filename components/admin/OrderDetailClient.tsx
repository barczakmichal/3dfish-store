'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrderStatus } from '@prisma/client'
import OrderStatusBadge from '@/components/admin/OrderStatusBadge'
import ShippingActions from '@/components/admin/ShippingActions'

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Oczekujące',
  PAID: 'Opłacone',
  SHIPPED: 'Wysłane',
  DELIVERED: 'Dostarczone',
  CANCELLED: 'Anulowane',
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  status_change: 'Zmiana statusu',
  note_added: 'Notatka',
  email_sent: 'Wysłano e-mail',
  payment_received: 'Płatność otrzymana',
  shipment_created: 'Przesyłka utworzona',
  pickup_ordered: 'Zamówiono kuriera',
}

const ACTOR_LABELS: Record<string, string> = {
  system: 'System',
  admin: 'Admin',
  stripe: 'Stripe',
  furgonetka: 'Furgonetka',
}

interface OrderItem {
  id: string
  quantity: number
  price: string | number
  product: {
    id: string
    name: string
    slug: string
    images: string[]
  }
}

interface OrderEvent {
  id: string
  type: string
  fromValue: string | null
  toValue: string | null
  note: string | null
  actor: string
  createdAt: string
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  street: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  pickupPointName: string | null
  pickupPointId: string | null
  total: string | number
  shippingCost: string | number | null
  shippingMethod: string | null
  shippingCarrier: string | null
  status: OrderStatus
  stripeSessionId: string | null
  trackingNumber: string | null
  furgonetkaId: string | null
  labelUrl: string | null
  createdAt: string
  items: OrderItem[]
  events: OrderEvent[]
}

interface Props {
  order: Order
}

export default function OrderDetailClient({ order }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [statusLoading, setStatusLoading] = useState(false)
  const [note, setNote] = useState('')
  const [noteLoading, setNoteLoading] = useState(false)
  const [events, setEvents] = useState<OrderEvent[]>(order.events)
  const [noteError, setNoteError] = useState<string | null>(null)

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status) return
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setStatus(newStatus as OrderStatus)
        router.refresh()
      } else {
        alert('Błąd podczas zmiany statusu.')
      }
    } catch {
      alert('Błąd połączenia z serwerem.')
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    setNoteLoading(true)
    setNoteError(null)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      if (res.ok) {
        const newEvent = await res.json()
        setEvents(prev => [...prev, newEvent])
        setNote('')
      } else {
        const data = await res.json()
        setNoteError(data.error || 'Błąd dodawania notatki.')
      }
    } catch {
      setNoteError('Błąd połączenia z serwerem.')
    } finally {
      setNoteLoading(false)
    }
  }

  const itemsTotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )

  const noteEvents = events.filter(e => e.type === 'note_added')
  const timelineEvents = events.filter(e => e.type !== 'note_added')

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <a
          href="/admin/orders"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Powrót do listy
        </a>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Zamówienie <span className="font-mono text-gray-500 text-lg">{order.id.slice(0, 8)}...</span>
          </h1>
          <OrderStatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Zmień status:</label>
          <select
            value={status}
            disabled={statusLoading}
            onChange={e => handleStatusChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lewa kolumna: dane klienta + produkty + finanse */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dane klienta */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dane klienta</h2>
            <dl className="space-y-3">
              <div className="flex gap-2">
                <dt className="text-sm font-medium text-gray-500 w-32 shrink-0">Imię i nazwisko</dt>
                <dd className="text-sm text-gray-900">{order.customerName}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-sm font-medium text-gray-500 w-32 shrink-0">E-mail</dt>
                <dd className="text-sm">
                  <a href={`mailto:${order.customerEmail}`} className="text-blue-600 hover:underline">
                    {order.customerEmail}
                  </a>
                </dd>
              </div>
              {order.customerPhone && (
                <div className="flex gap-2">
                  <dt className="text-sm font-medium text-gray-500 w-32 shrink-0">Telefon</dt>
                  <dd className="text-sm">
                    <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">
                      {order.customerPhone}
                    </a>
                  </dd>
                </div>
              )}
              {(order.street || order.city) && (
                <div className="flex gap-2">
                  <dt className="text-sm font-medium text-gray-500 w-32 shrink-0">Adres dostawy</dt>
                  <dd className="text-sm text-gray-900">
                    {order.street && <div>{order.street}</div>}
                    {(order.postalCode || order.city) && (
                      <div>{[order.postalCode, order.city].filter(Boolean).join(' ')}</div>
                    )}
                    {order.country && order.country !== 'PL' && <div>{order.country}</div>}
                  </dd>
                </div>
              )}
              {order.pickupPointName && (
                <div className="flex gap-2">
                  <dt className="text-sm font-medium text-gray-500 w-32 shrink-0">Punkt InPost</dt>
                  <dd className="text-sm text-gray-900">
                    {order.pickupPointName}
                    {order.pickupPointId && (
                      <span className="text-gray-400 ml-1">({order.pickupPointId})</span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Pozycje zamówienia */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pozycje zamówienia</h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  {item.product.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <a
                      href={`/admin/products/${item.product.id}/edit`}
                      className="text-sm font-medium text-gray-900 hover:text-orange-600 hover:underline truncate block"
                    >
                      {item.product.name}
                    </a>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × {Number(item.price).toFixed(2)} PLN
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 shrink-0">
                    {(Number(item.price) * item.quantity).toFixed(2)} PLN
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Podsumowanie finansowe */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Podsumowanie finansowe</h2>
            <dl className="space-y-2">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Wartość produktów</dt>
                <dd className="font-medium text-gray-900">{itemsTotal.toFixed(2)} PLN</dd>
              </div>
              {order.shippingCost != null && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">
                    Koszt wysyłki
                    {order.shippingMethod && (
                      <span className="text-gray-400 ml-1">({order.shippingMethod})</span>
                    )}
                  </dt>
                  <dd className="font-medium text-gray-900">{Number(order.shippingCost).toFixed(2)} PLN</dd>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                <dt className="font-semibold text-gray-900">Łącznie</dt>
                <dd className="font-bold text-gray-900">{Number(order.total).toFixed(2)} PLN</dd>
              </div>
            </dl>
          </section>
        </div>

        {/* Prawa kolumna: wysyłka + płatność */}
        <div className="space-y-6">
          {/* Sekcja wysyłki */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wysyłka</h2>
            <dl className="space-y-3 mb-4">
              {order.shippingMethod && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Metoda</dt>
                  <dd className="text-sm text-gray-900 mt-0.5">{order.shippingMethod}</dd>
                </div>
              )}
              {order.shippingCarrier && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Przewoźnik</dt>
                  <dd className="text-sm text-gray-900 mt-0.5">{order.shippingCarrier}</dd>
                </div>
              )}
              {order.trackingNumber && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Numer tracking</dt>
                  <dd className="text-sm font-mono text-gray-900 mt-0.5">{order.trackingNumber}</dd>
                </div>
              )}
            </dl>
            <ShippingActions
              orderId={order.id}
              furgonetkaId={order.furgonetkaId}
              trackingNumber={order.trackingNumber}
              shippingMethod={order.shippingMethod}
              labelUrl={order.labelUrl}
            />
          </section>

          {/* Sekcja płatności */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Płatność</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status płatności</dt>
                <dd className="mt-0.5">
                  <OrderStatusBadge status={status} />
                </dd>
              </div>
              {order.stripeSessionId && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sesja Stripe</dt>
                  <dd className="text-xs font-mono text-gray-600 mt-0.5 break-all">{order.stripeSessionId}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Data zamówienia</dt>
                <dd className="text-sm text-gray-900 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      {/* Historia zdarzeń */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Historia zdarzeń</h2>
        {timelineEvents.length === 0 ? (
          <p className="text-sm text-gray-400">Brak zdarzeń.</p>
        ) : (
          <ol className="relative border-l border-gray-200 space-y-4 ml-3">
            {timelineEvents.map(event => (
              <li key={event.id} className="ml-4">
                <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-orange-400 border-2 border-white" />
                <time className="text-xs text-gray-400">
                  {new Date(event.createdAt).toLocaleString('pl-PL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
                <p className="text-sm font-medium text-gray-800">
                  {EVENT_TYPE_LABELS[event.type] ?? event.type}
                  <span className="text-xs font-normal text-gray-400 ml-2">
                    ({ACTOR_LABELS[event.actor] ?? event.actor})
                  </span>
                </p>
                {event.type === 'status_change' && event.fromValue && event.toValue && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {STATUS_LABELS[event.fromValue as OrderStatus] ?? event.fromValue}
                    {' → '}
                    {STATUS_LABELS[event.toValue as OrderStatus] ?? event.toValue}
                  </p>
                )}
                {event.note && (
                  <p className="text-xs text-gray-500 mt-0.5">{event.note}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Notatki wewnętrzne */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notatki wewnętrzne</h2>

        <form onSubmit={handleAddNote} className="mb-4 space-y-2">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Dodaj notatkę wewnętrzną..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
          {noteError && <p className="text-xs text-red-500">{noteError}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={noteLoading || !note.trim()}
              className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {noteLoading ? 'Zapisuję...' : 'Zapisz notatkę'}
            </button>
          </div>
        </form>

        {noteEvents.length === 0 ? (
          <p className="text-sm text-gray-400">Brak notatek.</p>
        ) : (
          <div className="space-y-3">
            {noteEvents.map(event => (
              <div key={event.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-gray-800">{event.note}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(event.createdAt).toLocaleString('pl-PL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
