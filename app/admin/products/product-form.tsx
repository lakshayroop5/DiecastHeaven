'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toSlug } from '@/lib/slug'
import { CheckCircle, XCircle } from 'lucide-react'

function RaceCar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g className="origin-[0_20px]" style={{ animation: 'flame-flicker 0.15s infinite alternate' }}>
        <ellipse cx="-6" cy="22" rx="6" ry="3" fill="#FF4500" opacity="0.8" />
        <ellipse cx="-9" cy="22" rx="4" ry="2" fill="#FFD700" opacity="0.6" />
      </g>
      <path d="M10 28 L20 12 L40 8 L80 8 L100 12 L110 20 L110 28 Z" fill="#E3292E" />
      <path d="M8 26 L12 22 L12 28 Z" fill="#E3292E" />
      <rect x="2" y="25" width="14" height="3" rx="1.5" fill="#E3292E" />
      <rect x="105" y="5" width="3" height="11" rx="1" fill="#E3292E" />
      <rect x="100" y="3" width="12" height="3" rx="1.5" fill="#E3292E" />
      <path d="M40 8 L50 3 L70 3 L80 8 Z" fill="#222" />
      <rect x="28" y="14" width="56" height="3" rx="1.5" fill="#FFD700" />
      <g style={{ animation: 'wheel-spin 0.6s linear infinite', transformOrigin: '25px 30px' }}>
        <circle cx="25" cy="30" r="7" fill="#1A1A1A" stroke="#fff" strokeWidth="1.5" />
        <line x1="25" y1="23" x2="25" y2="37" stroke="#fff" strokeWidth="1" />
        <line x1="18" y1="30" x2="32" y2="30" stroke="#fff" strokeWidth="1" />
        <circle cx="25" cy="30" r="2.5" fill="#E3292E" />
      </g>
      <g style={{ animation: 'wheel-spin 0.6s linear infinite', transformOrigin: '93px 30px' }}>
        <circle cx="93" cy="30" r="7" fill="#1A1A1A" stroke="#fff" strokeWidth="1.5" />
        <line x1="93" y1="23" x2="93" y2="37" stroke="#fff" strokeWidth="1" />
        <line x1="86" y1="30" x2="100" y2="30" stroke="#fff" strokeWidth="1" />
        <circle cx="93" cy="30" r="2.5" fill="#E3292E" />
      </g>
      <path d="M45 8 C55 -2 65 -2 75 8" stroke="#fff" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

interface Brand { id: string; name: string }
interface Category { id: string; name: string }
interface ProductImage { imageUrl: string; altText: string | null; id?: string }

interface Props {
  product?: {
    id: string; title: string; slug: string; description: string | null
    shortDesc: string | null; scale: string | null; price: number | null
    offerPrice: number | null; status: string; featured: boolean
    stock: number; sortOrder: number; orderType: string; depositAmount: number | null
    brandId: string | null; categories: Array<{ categoryId: string }>
    images: ProductImage[]
  }
}

export default function ProductForm({ product }: Props) {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [overlayState, setOverlayState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: product?.title || '',
    slug: product?.slug || '',
    description: product?.description || '',
    shortDesc: product?.shortDesc || '',
    scale: product?.scale || '',
    price: product?.price?.toString() || '',
    offerPrice: product?.offerPrice?.toString() || '',
    status: product?.status || 'DRAFT',
    featured: product?.featured || false,
    stock: product?.stock?.toString() || '0',
    orderType: product?.orderType || 'RTD',
    depositAmount: product?.depositAmount?.toString() || '',
    brandId: product?.brandId || '',
    categoryIds: product?.categories.map((c) => c.categoryId) || [],
    imageUrl: product?.images[0]?.imageUrl || '',
    imageAlt: product?.images[0]?.altText || '',
    imageId: product?.images[0]?.id || '',
  })

  useEffect(() => {
    fetch('/api/admin/brands').then((r) => r.json()).then(setBrands)
    fetch('/api/admin/categories').then((r) => r.json()).then(setCategories)
  }, [])

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }))

  const toggleCategory = (id: string) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id)
        ? f.categoryIds.filter((c) => c !== id)
        : [...f.categoryIds, id],
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10MB'); return }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    if (res.ok) {
      const { id, imageUrl } = await res.json()
      setForm((f) => ({ ...f, imageUrl, imageId: id }))
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOverlayState('uploading')

    try {
      const body = {
        title: form.title,
        slug: form.slug || toSlug(form.title),
        description: form.description || null,
        shortDesc: form.shortDesc || null,
        scale: form.scale || null,
        price: form.price ? parseFloat(form.price) : null,
        offerPrice: form.offerPrice ? parseFloat(form.offerPrice) : null,
        status: form.status,
        orderType: form.orderType,
        depositAmount: form.orderType === 'PRE_ORDER' && form.depositAmount ? parseFloat(form.depositAmount) : null,
        featured: form.featured,
        stock: parseInt(form.stock) || 0,
        brandId: form.brandId || null,
        categoryIds: form.categoryIds,
        images: form.imageUrl
          ? [{ imageUrl: form.imageUrl, altText: form.imageAlt || null, sortOrder: 0, id: form.imageId || undefined }]
          : [],
      }

      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || `Server error (${res.status})`)
      }

      setOverlayState('success')
      setTimeout(() => {
        router.push('/admin/products')
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong')
      setOverlayState('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input type="text" value={form.title} required onChange={(v) => set('title', v.target.value)}
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Slug</label>
          <input type="text" value={form.slug} onChange={(v) => set('slug', v.target.value)} placeholder="auto-generated"
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Short Description</label>
        <input type="text" value={form.shortDesc} onChange={(v) => set('shortDesc', v.target.value)}
          className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
          className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Scale</label>
          <input type="text" value={form.scale} onChange={(v) => set('scale', v.target.value)} placeholder="1:64"
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Price</label>
          <input type="number" value={form.price} onChange={(v) => set('price', v.target.value)}
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Offer Price</label>
          <input type="number" value={form.offerPrice} onChange={(v) => set('offerPrice', v.target.value)}
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Stock</label>
          <input type="number" value={form.stock} onChange={(v) => set('stock', v.target.value)}
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Brand</label>
          <select value={form.brandId} onChange={(e) => set('brandId', e.target.value)} className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray text-sm">
            <option value="">None</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray text-sm">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="SOLD_OUT">Sold Out</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Order Type</label>
          <select value={form.orderType} onChange={(e) => set('orderType', e.target.value)} className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray text-sm">
            <option value="RTD">RTD (Ready to Dispatch)</option>
            <option value="PRE_ORDER">Pre-Order</option>
          </select>
        </div>
      </div>

      {form.orderType === 'PRE_ORDER' && (
        <div>
          <label className="block text-sm text-gray-400 mb-1">Deposit Amount</label>
          <input type="number" value={form.depositAmount} onChange={(v) => set('depositAmount', v.target.value)}
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm"
            placeholder="Amount customer pays upfront" />
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-400 mb-1">Categories</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                form.categoryIds.includes(c.id)
                  ? 'bg-hotwheels-red border-hotwheels-red text-white'
                  : 'border-hotwheels-gray text-gray-400 hover:border-hotwheels-red'
              }`}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Image</label>
        <div className="flex items-center gap-4">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="px-4 py-2 border border-hotwheels-gray rounded text-sm text-gray-300 hover:border-hotwheels-red disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          {form.imageUrl && (
            <div className="flex items-center gap-2">
              <img src={form.imageUrl} alt="" className="h-12 w-12 object-cover rounded" />
              <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: '', imageId: '' }))} className="text-red-400 text-xs hover:underline">Remove</button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Alt Text</label>
          <input type="text" value={form.imageAlt} onChange={(v) => set('imageAlt', v.target.value)} placeholder="Image description"
            className="w-full px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="rounded" />
        Featured product
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={overlayState === 'uploading'} className="px-6 py-2 bg-hotwheels-red text-white rounded font-semibold hover:bg-red-700 disabled:opacity-50">
          {product ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-hotwheels-gray rounded text-gray-400 hover:text-white">
          Cancel
        </button>
      </div>

      {overlayState !== 'idle' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative flex flex-col items-center gap-5 px-10 py-8 rounded-2xl bg-[#1a1a1a] border border-hotwheels-red/40 shadow-[0_0_40px_rgba(227,41,46,0.15)]">
            {overlayState === 'uploading' && (
              <>
                <div className="relative z-10" style={{ animation: 'car-bounce 0.4s ease-in-out infinite alternate' }}>
                  <RaceCar className="w-28 h-12 drop-shadow-[0_0_12px_rgba(227,41,46,0.5)]" />
                </div>
                <p className="relative z-10 text-sm font-bold tracking-widest text-hotwheels-red uppercase">
                  Diecast Heaven Udaipur
                </p>
                <p className="relative z-10 text-[11px] tracking-[0.2em] text-gray-400 uppercase">
                  Uploading<span style={{ animation: 'dots 1.4s steps(4) infinite' }}>...</span>
                </p>
              </>
            )}

            {overlayState === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500" />
                <p className="relative z-10 text-sm font-bold tracking-widest text-green-500 uppercase">
                  Product saved!
                </p>
                <p className="relative z-10 text-[11px] tracking-[0.2em] text-gray-400 uppercase">
                  Redirecting...
                </p>
              </>
            )}

            {overlayState === 'error' && (
              <>
                <XCircle className="w-16 h-16 text-red-500" />
                <p className="relative z-10 text-sm font-bold tracking-widest text-red-500 uppercase">
                  Upload failed
                </p>
                <p className="relative z-10 text-[11px] tracking-[0.15em] text-gray-400 max-w-[250px] text-center">
                  {errorMessage}
                </p>
                <button
                  type="button"
                  onClick={() => setOverlayState('idle')}
                  className="mt-2 px-6 py-2 bg-hotwheels-red text-white rounded font-semibold hover:bg-red-700"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </form>
  )
}
