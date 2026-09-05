'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'

interface HeroMediaItem {
  id: string; url: string; type: string; sortOrder: number
}

export default function HeroMediaManager() {
  const [media, setMedia] = useState<HeroMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  useEffect(() => {
    fetch('/api/admin/hero-media')
      .then((r) => r.json())
      .then((data) => { setMedia(data); setLoading(false) })
  }, [])

  const handleUpload = async (file: File) => {
    setError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', 'hero')
      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const uploaded = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploaded.error || 'Upload failed')

      const createRes = await fetch('/api/admin/hero-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: uploaded.imageUrl, type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE' }),
      })
      if (!createRes.ok) throw new Error('Could not save media')
      const created = await createRes.json()
      setMedia((prev) => [...prev, created])
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = media.findIndex((m) => m.id === active.id)
    const newIndex = media.findIndex((m) => m.id === over.id)
    const reordered = arrayMove(media, oldIndex, newIndex)
    setMedia(reordered)

    setSavingOrder(true)
    await fetch('/api/admin/hero-media/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: reordered.map((m) => m.id) }),
    })
    setSavingOrder(false)
  }

  const handleDelete = async (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id))
    await fetch(`/api/admin/hero-media/${id}`, { method: 'DELETE' })
  }

  return (
    <div className="mt-10 pt-8 border-t border-hotwheels-gray max-w-lg">
      <h2 className="text-xl font-bold mb-1">Hero Banner Media</h2>
      <p className="text-sm text-gray-400 mb-4">
        Images and videos shown in the home page carousel. Drag to change the order.
        If empty, the default banner is shown.
      </p>

      <label className="inline-block cursor-pointer px-4 py-2 bg-hotwheels-red text-white rounded text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
        {uploading ? 'Uploading...' : '+ Upload Image or Video'}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
          }}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {savingOrder && <p className="mt-2 text-xs text-gray-400">Saving order...</p>}

      {!loading && media.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
          <ul className="mt-4 space-y-2">
            <SortableContext items={media.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              {media.map((m) => (
                <SortableMediaRow key={m.id} item={m} onDelete={handleDelete} />
              ))}
            </SortableContext>
          </ul>
        </DndContext>
      )}
      {!loading && media.length === 0 && !uploading && (
        <p className="mt-4 text-sm text-gray-500">No media uploaded yet.</p>
      )}
    </div>
  )
}

function SortableMediaRow({ item, onDelete }: { item: HeroMediaItem; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  }

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-3 p-2 rounded border border-hotwheels-gray bg-hotwheels-black">
      <span
        className="cursor-grab active:cursor-grabbing text-gray-500 select-none px-1"
        style={{ touchAction: 'none' }}
        {...attributes}
        {...listeners}
      >
        ⠿
      </span>
      <div className="w-16 h-10 flex-shrink-0 rounded overflow-hidden bg-hotwheels-gray relative">
        {item.type === 'VIDEO' ? (
          <video src={`${item.url}#t=0.1`} muted playsInline preload="metadata" className="w-full h-full object-cover" />
        ) : (
          <Image src={item.url} alt="" fill sizes="64px" className="object-cover" />
        )}
      </div>
      <span className="text-xs text-gray-400 uppercase">{item.type}</span>
      <button
        onClick={() => onDelete(item.id)}
        className="ml-auto text-xs text-red-400 hover:text-red-300"
      >
        Delete
      </button>
    </li>
  )
}
