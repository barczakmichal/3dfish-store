'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  productId: string
  productName: string
}

export default function DeleteProductButton({ productId, productName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Czy na pewno chcesz usunąć produkt "${productName}"?`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Błąd podczas usuwania produktu.')
      }
    } catch {
      alert('Błąd połączenia z serwerem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-800 disabled:text-red-300 text-sm font-medium"
    >
      {loading ? 'Usuwanie...' : 'Usuń'}
    </button>
  )
}
