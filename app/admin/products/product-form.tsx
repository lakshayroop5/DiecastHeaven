'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toSlug } from '@/lib/slug'

interface Brand { id: string; name: string }
interface Category { id: string; name: string }
interface ProductImage { imageUrl: string; altText: string | null; id?: string }

interface Props {
  product?: {
    id: string; title: string; slug: string; description: string | null
    shortDesc: string | null; scale: string | null; price: number | null
    offerPrice: number | null; status: string; featured: boolean
    stock: number; sortOrder: number
    brandId: string | null; categories: Array<{ categoryId: string }>
    images: ProductImage[]
  }
}

export default function ProductForm({ product }: Props) {
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
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
    if (file.size > 1024 * 1024) { alert('Image must be under 1MB'); return }

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
    setSaving(true)

    const body = {
      title: form.title,
      slug: form.slug || toSlug(form.title),
      description: form.description || null,
      shortDesc: form.shortDesc || null,
      scale: form.scale || null,
      price: form.price ? parseFloat(form.price) : null,
      offerPrice: form.offerPrice ? parseFloat(form.offerPrice) : null,
      status: form.status,
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

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    router.push('/admin/products')
    router.refresh()
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

      <div className="grid grid-cols-2 gap-4">
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
      </div>

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
        <button type="submit" disabled={saving} className="px-6 py-2 bg-hotwheels-red text-white rounded font-semibold hover:bg-red-700 disabled:opacity-50">
          {saving ? 'Saving...' : product ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-hotwheels-gray rounded text-gray-400 hover:text-white">
          Cancel
        </button>
      </div>
    </form>
  )
}
