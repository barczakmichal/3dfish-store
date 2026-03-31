'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface ProductFormData {
  id?: string
  name: string
  description: string
  price: number
  images: string[]
  stock: number
  category: string
  slug: string
}

interface Props {
  initialData?: ProductFormData
  mode: 'new' | 'edit'
}

const CATEGORIES = [
  'Przynęty',
  'Wędki',
  'Kołowrotki',
  'Akcesoria',
  'Zestawy',
  'Inne',
]

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
    .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
    .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ProductForm({ initialData, mode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [price, setPrice] = useState(initialData?.price?.toString() ?? '')
  const [stock, setStock] = useState(initialData?.stock?.toString() ?? '0')
  const [category, setCategory] = useState(initialData?.category ?? CATEGORIES[0])
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [imagesRaw, setImagesRaw] = useState(initialData?.images?.join('\n') ?? '')

  function handleNameChange(val: string) {
    setName(val)
    if (mode === 'new') {
      setSlug(generateSlug(val))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const images = imagesRaw.split('\n').map(s => s.trim()).filter(Boolean)
    const payload = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      category,
      slug,
      images,
    }

    try {
      const url = mode === 'edit' && initialData?.id
        ? `/api/admin/products/${initialData.id}`
        : '/api/admin/products'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Wystąpił błąd.')
      } else {
        router.push('/admin/products')
        router.refresh()
      }
    } catch {
      setError('Błąd połączenia z serwerem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nazwa produktu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="np. Przynęta na szczupaka 3D"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
            placeholder="przyneta-na-szczupaka-3d"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategoria <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cena (PLN) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="49.99"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stan magazynowy (szt.)
          </label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={e => setStock(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="0"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opis produktu <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Opis produktu widoczny dla klientów..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zdjęcia (URL, każde w nowej linii)
          </label>
          <textarea
            value={imagesRaw}
            onChange={e => setImagesRaw(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
            placeholder="https://example.com/zdjecie1.jpg&#10;https://example.com/zdjecie2.jpg"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Zapisywanie...' : mode === 'edit' ? 'Zapisz zmiany' : 'Dodaj produkt'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          Anuluj
        </button>
      </div>
    </form>
  )
}
