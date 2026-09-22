'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { Info } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import DeleteButton from '../delete-button'

interface Product {
  id: string; title: string; slug: string; stock: number; status: string; orderType: string
  price: number | null; offerPrice: number | null; sortOrder: number
  brand: { name: string } | null
}

const FILTER_KEY = 'admin-products-filters'

export default function SortableProducts({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [stockFilter, setStockFilter] = useState('ALL')
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL')
  const router = useRouter()

  const brands = Array.from(new Set(initial.map((p) => p.brand?.name).filter(Boolean))) as string[]

  const filtered = products.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    if (brandFilter !== 'ALL' && p.brand?.name !== brandFilter) return false
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
    if (stockFilter === 'IN_STOCK' && p.stock === 0) return false
    if (stockFilter === 'OUT_OF_STOCK' && p.stock > 0) return false
    if (orderTypeFilter !== 'ALL' && p.orderType !== orderTypeFilter) return false
    return true
  })

  // ponytail: sync state when server re-fetches after reorder/refresh
  useEffect(() => { setProducts(initial) }, [initial])

  // ponytail: defaults first so client matches server HTML, restore stored filters after mount
  const firstSave = useRef(true)
  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem(FILTER_KEY) || '{}') as Record<string, string>
      if (s.search) setSearch(s.search)
      if (s.brandFilter) setBrandFilter(s.brandFilter)
      if (s.statusFilter) setStatusFilter(s.statusFilter)
      if (s.stockFilter) setStockFilter(s.stockFilter)
      if (s.orderType) setOrderTypeFilter(s.orderType)
    } catch { /* corrupted entry ignored, defaults stand */ }
  }, [])

  useEffect(() => {
    if (firstSave.current) { firstSave.current = false; return }
    try { sessionStorage.setItem(FILTER_KEY, JSON.stringify({ search, brandFilter, statusFilter, stockFilter, orderType: orderTypeFilter })) } catch { /* ponytail: private-mode write can throw, filters just reset */ }
  }, [search, brandFilter, statusFilter, stockFilter, orderTypeFilter])

  // one-time reindex: spread legacy sequential sortOrders into spaced values
  useEffect(() => {
    if (localStorage.getItem('products-reindexed-v2')) return
    fetch('/api/admin/products/reorder', { method: 'PATCH' }).then(() => {
      localStorage.setItem('products-reindexed-v2', '1')
      router.refresh()
    })
  }, [])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const isFiltered = search !== '' || brandFilter !== 'ALL' || statusFilter !== 'ALL' || stockFilter !== 'ALL' || orderTypeFilter !== 'ALL'

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id || isFiltered) return

    const oldIndex = products.findIndex((p) => p.id === active.id)
    const newIndex = products.findIndex((p) => p.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const prev = products
    const reordered = arrayMove(products, oldIndex, newIndex)
    setProducts(reordered)

    setSaving(true)
    try {
      const res = await fetch('/api/admin/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeId: active.id, overId: over.id }),
      })
      if (!res.ok) throw new Error(`reorder failed (${res.status})`)
      const data = await res.json().catch(() => null)
      if (typeof data?.sortOrder === 'number') {
        const sortOrder = data.sortOrder as number
        setProducts((cur) => cur.map((p) => (p.id === active.id ? { ...p, sortOrder } : p)))
      }
    } catch {
      // ponytail: rollback optimistic move, server state wins
      setProducts(prev)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 bg-hotwheels-black border border-hotwheels-gray rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-hotwheels-yellow flex-1 min-w-[200px]"
        />
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="px-3 py-2 bg-hotwheels-black border border-hotwheels-gray rounded text-sm text-white focus:outline-none focus:border-hotwheels-yellow">
          <option value="ALL">All Brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-hotwheels-black border border-hotwheels-gray rounded text-sm text-white focus:outline-none focus:border-hotwheels-yellow">
          <option value="ALL">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="px-3 py-2 bg-hotwheels-black border border-hotwheels-gray rounded text-sm text-white focus:outline-none focus:border-hotwheels-yellow">
          <option value="ALL">All Stock</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
        <select value={orderTypeFilter} onChange={(e) => setOrderTypeFilter(e.target.value)} className="px-3 py-2 bg-hotwheels-black border border-hotwheels-gray rounded text-sm text-white focus:outline-none focus:border-hotwheels-yellow">
          <option value="ALL">All Types</option>
          <option value="RTD">RTD</option>
          <option value="PRE_ORDER">Pre-Order</option>
        </select>
        {isFiltered && (
          <button type="button" onClick={() => { setSearch(''); setBrandFilter('ALL'); setStatusFilter('ALL'); setStockFilter('ALL'); setOrderTypeFilter('ALL') }} className="px-3 py-2 border border-hotwheels-gray rounded text-sm text-gray-400 hover:text-white hover:border-hotwheels-yellow">
            Reset
          </button>
        )}
      </div>
      {isFiltered && (
        <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded border border-hotwheels-yellow/30 bg-hotwheels-yellow/10 text-xs text-hotwheels-yellow">
          <Info className="h-4 w-4 shrink-0" />
          <span>Reordering is paused while filters are active. Reset the filters to reorder products.</span>
        </div>
      )}

      <div className="bg-hotwheels-gray rounded-lg border border-hotwheels-black overflow-x-auto">
        {saving && <div className="px-4 py-2 text-xs text-gray-400 border-b border-hotwheels-black">Saving order...</div>}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hotwheels-black text-left text-gray-400">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <SortableContext items={filtered.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No products match your filters</td></tr>
                ) : filtered.map((p) => (
                  <SortableRow key={p.id} product={p} />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>
    </div>
  )
}

function SortableRow({ product: p }: { product: Product }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-hotwheels-black hover:bg-hotwheels-black/50">
      <td className="px-4 py-3 cursor-grab active:cursor-grabbing text-gray-500 select-none" style={{ touchAction: 'none' }} {...attributes} {...listeners}>
        ⠿
      </td>
      <td className="px-4 py-3 font-medium">{p.title}</td>
      <td className="px-4 py-3 text-gray-400">{p.brand?.name ?? '—'}</td>
      <td className="px-4 py-3 text-hotwheels-yellow">
        {p.offerPrice ? `${formatPrice(p.offerPrice)} (was ${formatPrice(p.price)})` : formatPrice(p.price)}
      </td>
      <td className="px-4 py-3">
        <span className={p.stock === 0 ? 'text-red-400' : 'text-gray-300'}>{p.stock}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'PUBLISHED' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
          {p.status}
        </span>
      </td>
      <td className="px-4 py-3 space-x-2">
        <Link href={`/admin/products/${p.id}`} className="text-hotwheels-yellow hover:underline">Edit</Link>
        <DeleteButton endpoint={`/api/admin/products/${p.id}`} />
      </td>
    </tr>
  )
}
