'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toSlug } from '@/lib/slug'
import { CheckCircle, XCircle } from 'lucide-react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
interface FormImage { imageUrl: string; altText: string; id?: string }

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
  const [pending, setPending] = useState<Array<{ key: string; preview: string; name: string }>>([])
  const fileRef = useRef<HTMLInputElement>(null)
  // ponytail: snapshot edit-mode images; skip image writes when untouched
  const initialImages = useRef(
    (product?.images || []).map((img) => `${img.imageUrl}|${img.altText || ''}`).join('\n')
  )
  // ponytail: same trick for categories; server skips omitted keys
  const initialCategories = useRef(
    [...(product?.categories.map((c) => c.categoryId) || [])].sort().join(',')
  )
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )
  const [form, setForm] = useState<{
    title: string; slug: string; description: string; shortDesc: string; scale: string;
    price: string; offerPrice: string; status: string; featured: boolean; stock: string;
    orderType: string; depositAmount: string; brandId: string; categoryIds: string[]; images: FormImage[];
  }>({
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
    images: (product?.images || []).map((img) => ({ imageUrl: img.imageUrl, altText: img.altText || '', id: img.id })),
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
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const valid = files.filter((f) => {
      if (f.size > 10 * 1024 * 1024) { alert(`${f.name}: Image must be under 10MB`); return false }
      return true
    })
    if (!valid.length) { e.target.value = ''; return }

    const previews = valid.map((f) => ({ key: `${Date.now()}-${f.name}`, preview: URL.createObjectURL(f), name: f.name }))
    setPending(previews)
    setUploading(true)
    try {
      await Promise.all(valid.map(async (file, i) => {
        const formData = new FormData()
        formData.append('file', file)
        try {
          const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
          if (res.ok) {
            const { id, imageUrl } = await res.json() as { id?: string; imageUrl: string }
            if (imageUrl) setForm((f) => ({ ...f, images: [...f.images, { imageUrl, altText: '', id }] }))
          }
        } finally {
          URL.revokeObjectURL(previews[i].preview)
          setPending((p) => p.filter((x) => x.key !== previews[i].key))
        }
      }))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleImageDragEnd = (event: { active: { id: string | number }; over?: { id: string | number } | null }) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setForm((f) => {
      const ids = f.images.map((img) => img.imageUrl)
      const oldIndex = ids.indexOf(String(active.id))
      const newIndex = ids.indexOf(String(over.id))
      if (oldIndex < 0 || newIndex < 0) return f
      return { ...f, images: arrayMove(f.images, oldIndex, newIndex) }
    })
  }

  const removeImage = (idx: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))

  const makeMain = (idx: number) =>
    setForm((f) => {
      const imgs = [...f.images]
      const [picked] = imgs.splice(idx, 1)
      return { ...f, images: [picked, ...imgs] }
    })

  const setImageAlt = (idx: number, altText: string) =>
    setForm((f) => ({ ...f, images: f.images.map((img, i) => (i === idx ? { ...img, altText } : img)) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOverlayState('uploading')

    try {
      const imageKey = form.images.map((img) => `${img.imageUrl}|${img.altText || ''}`).join('\n')
      const imagesChanged = !product || imageKey !== initialImages.current
      const categoryKey = [...form.categoryIds].sort().join(',')
      const categoriesChanged = !product || categoryKey !== initialCategories.current
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
        ...(categoriesChanged ? { categoryIds: form.categoryIds } : {}),
        ...(imagesChanged
          ? {
              images: form.images.map((img, i) => ({
                imageUrl: img.imageUrl, altText: img.altText || null, sortOrder: i, id: img.id || undefined,
              })),
            }
          : {}),
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
      router.push('/admin/products')
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
        <label className="block text-sm text-gray-400 mb-1">Images {form.images.length > 0 && <span className="text-gray-500">(drag to reorder, first = main)</span>}</label>
        <div className="flex items-center gap-4">
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="px-4 py-2 border border-hotwheels-gray rounded text-sm text-gray-300 hover:border-hotwheels-red disabled:opacity-50 flex items-center gap-2">
            {uploading && (
              <svg className="animate-spin h-4 w-4 text-hotwheels-yellow" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {uploading ? `Uploading ${pending.length}...` : 'Upload Images'}
          </button>
        </div>
        {(form.images.length > 0 || pending.length > 0) && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleImageDragEnd}>
            <SortableContext items={form.images.map((img) => img.imageUrl)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {form.images.map((img, idx) => (
                  <SortableImageTile key={img.imageUrl} id={img.imageUrl} index={idx}
                    imageUrl={img.imageUrl} altText={img.altText || ''}
                    onRemove={() => removeImage(idx)} onMakeMain={() => makeMain(idx)}
                    onAlt={(v) => setImageAlt(idx, v)} />
                ))}
                {pending.map((p) => (
                  <div key={p.key} className="relative rounded overflow-hidden border border-hotwheels-gray animate-pulse">
                    <img src={p.preview} alt={p.name} className="h-20 w-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <svg className="animate-spin h-6 w-6 text-hotwheels-yellow" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    </div>
                    <div className="px-1 py-1 bg-hotwheels-black text-[11px] text-gray-400 truncate">{p.name}</div>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
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
                  Saving<span style={{ animation: 'dots 1.4s steps(4) infinite' }}>...</span>
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

function SortableImageTile({ id, index, imageUrl, altText, onRemove, onMakeMain, onAlt }: {
  id: string; index: number; imageUrl: string; altText: string;
  onRemove: () => void; onMakeMain: () => void; onAlt: (v: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="relative group rounded overflow-hidden border border-hotwheels-gray bg-hotwheels-black">
      <div className="relative">
        <img src={imageUrl} alt="" className="h-20 w-full object-cover" />
        <span {...attributes} {...listeners} title="Drag to reorder" style={{ touchAction: 'none' }}
          className="absolute top-1 right-1 cursor-grab active:cursor-grabbing bg-black/70 text-gray-200 text-xs px-1.5 py-0.5 rounded select-none">⠿</span>
        {index === 0 && <span className="absolute top-1 left-1 bg-hotwheels-yellow text-black text-[10px] font-bold px-1.5 py-0.5 rounded">MAIN</span>}
      </div>
      <div className="flex items-center justify-between px-1 py-1">
        <button type="button" onClick={onRemove} className="text-red-400 text-[11px] hover:underline">Remove</button>
        {index !== 0 && <button type="button" onClick={onMakeMain} className="text-gray-300 text-[11px] hover:underline">Main</button>}
      </div>
      <input type="text" value={altText} onChange={(v) => onAlt(v.target.value)} placeholder="Alt text"
        className="w-full px-1.5 py-1 bg-hotwheels-black text-white border-t border-hotwheels-gray outline-none text-[11px]" />
    </div>
  )
}
