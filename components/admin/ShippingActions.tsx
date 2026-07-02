'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orderId: string
  furgonetkaId: string | null
  trackingNumber: string | null
  shippingMethod: string | null
  labelUrl: string | null
}

export default function ShippingActions({ orderId, furgonetkaId, trackingNumber, shippingMethod, labelUrl }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function createShipment() {
    setLoading('create')
    setError(null)
    try {
      const res = await fetch('/api/admin/shipping/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Błąd tworzenia przesyłki')
      }
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(null)
    }
  }

  async function orderPickup() {
    if (!furgonetkaId) return
    setLoading('pickup')
    setError(null)
    try {
      const res = await fetch(`/api/admin/shipping/${furgonetkaId}/pickup`, {
        method: 'POST',
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Błąd zamawiania kuriera')
      }
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(null)
    }
  }

  if (!shippingMethod) {
    return <span className="text-xs text-gray-400">Brak wysyłki</span>
  }

  return (
    <div className="flex flex-col gap-1">
      {!furgonetkaId ? (
        <button
          onClick={createShipment}
          disabled={loading === 'create'}
          className="px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading === 'create' ? 'Tworzę...' : 'Utwórz przesyłkę'}
        </button>
      ) : (
        <>
          {trackingNumber && (
            <span className="text-xs text-gray-600 font-mono">{trackingNumber}</span>
          )}
          <div className="flex gap-1">
            {labelUrl || furgonetkaId ? (
              <a
                href={`/api/admin/shipping/${furgonetkaId}/label`}
                className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                target="_blank"
              >
                Etykieta
              </a>
            ) : null}
            <a
              href={`/api/admin/shipping/${furgonetkaId}/tracking`}
              className="px-2 py-1 text-xs font-medium bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              target="_blank"
            >
              Tracking
            </a>
            <button
              onClick={orderPickup}
              disabled={loading === 'pickup'}
              className="px-2 py-1 text-xs font-medium bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {loading === 'pickup' ? '...' : 'Kurier'}
            </button>
          </div>
        </>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
