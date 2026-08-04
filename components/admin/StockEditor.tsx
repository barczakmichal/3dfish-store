'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  productId: string
  currentStock: number
}

export default function StockEditor({ productId, currentStock }: Props) {
  const router = useRouter()
  const [stock, setStock] = useState(currentStock.toString())
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const changed = stock !== currentStock.toString()

  async function handleSave() {
    setLoading(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: parseInt(stock, 10) }),
      })
      if (res.ok) {
        setSaved(true)
        router.refresh()
        setTimeout(() => setSaved(false), 2000)
      } else {
        alert('Błąd podczas aktualizacji stanu magazynowego.')
      }
    } catch {
      alert('Błąd połączenia z serwerem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <input
        type="number"
        min="0"
        value={stock}
        onChange={e => setStock(e.target.value)}
        className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      {changed && (
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          {loading ? '...' : 'Zapisz'}
        </button>
      )}
      {saved && (
        <span className="text-green-600 text-sm font-medium">Zapisano</span>
      )}
    </div>
  )
}
