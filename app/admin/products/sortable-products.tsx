'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { formatPrice } from '@/lib/utils'
import DeleteButton from '../delete-button'

interface Product {
  id: string; title: string; slug: string; stock: number; status: string
  price: number | null; offerPrice: number | null; sortOrder: number
  brand: { name: string } | null
}

export default function SortableProducts({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  // ponytail: sync state when server re-fetches after reorder/refresh
  useEffect(() => { setProducts(initial) }, [initial])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = products.findIndex((p) => p.id === active.id)
    const newIndex = products.findIndex((p) => p.id === over.id)
    const reordered = arrayMove(products, oldIndex, newIndex)
    setProducts(reordered)

    setSaving(true)
    await fetch('/api/admin/products/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: reordered.map((p) => p.id) }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
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
          <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <tbody>
              {products.map((p) => (
                <SortableRow key={p.id} product={p} />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
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
