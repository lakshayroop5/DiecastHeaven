'use client'

import { useEffect, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'

interface ScrollList {
  id: string
  title: string
  sortOrder: number
  productCount: number
}

/** The API is the trust boundary; narrow its JSON before it reaches state. */
function isScrollList(value: unknown): value is ScrollList {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.sortOrder === 'number' &&
    typeof candidate.productCount === 'number'
  )
}

function isErrorPayload(value: unknown): value is { error: string } {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as Record<string, unknown>).error === 'string'
  )
}

export default function ScrollListManager() {
  const [lists, setLists] = useState<ScrollList[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [error, setError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  useEffect(() => {
    fetch('/api/admin/scroll-lists')
      .then((r) => r.json())
      .then((data) => { setLists(data); setLoading(false) })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = title.trim()
    if (!name) return
    setError('')
    setCreating(true)
    try {
      const res = await fetch('/api/admin/scroll-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: name }),
      })
      const payload: unknown = await res.json()
      if (!res.ok) {
        throw new Error(isErrorPayload(payload) ? payload.error : 'Could not create list')
      }
      if (!isScrollList(payload)) throw new Error('Could not create list')
      setLists((prev) => [...prev, payload])
      setTitle('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create list')
    } finally {
      setCreating(false)
    }
  }

  const handleRename = async (id: string, nextTitle: string) => {
    const name = nextTitle.trim()
    const current = lists.find((l) => l.id === id)
    if (!name || !current || name === current.title) return

    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, title: name } : l)))
    await fetch(`/api/admin/scroll-lists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: name }),
    })
  }

  const handleDelete = async (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id))
    await fetch(`/api/admin/scroll-lists/${id}`, { method: 'DELETE' })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = lists.findIndex((l) => l.id === active.id)
    const newIndex = lists.findIndex((l) => l.id === over.id)
    const reordered = arrayMove(lists, oldIndex, newIndex)
    setLists(reordered)

    setSavingOrder(true)
    await fetch('/api/admin/scroll-lists/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: reordered.map((l) => l.id) }),
    })
    setSavingOrder(false)
  }

  return (
    <div className="mt-10 pt-8 border-t border-hotwheels-gray max-w-lg">
      <h2 className="text-xl font-bold mb-1">Homepage Product Scroll Lists</h2>
      <p className="text-sm text-gray-400 mb-4">
        Each list becomes its own horizontally scrolling section on the home page,
        in this order. Assign products to a list from the product form. Lists with
        no products are hidden on the site.
      </p>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Trending Products"
          className="flex-1 px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray focus:border-hotwheels-red outline-none text-sm"
        />
        <button
          type="submit"
          disabled={creating || !title.trim()}
          className="px-4 py-2 bg-hotwheels-red text-white rounded text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
        >
          {creating ? 'Adding...' : '+ Add List'}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {savingOrder && <p className="mt-2 text-xs text-gray-400">Saving order...</p>}

      {!loading && lists.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToParentElement]}>
          <ul className="mt-4 space-y-2">
            <SortableContext items={lists.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              {lists.map((list) => (
                <SortableListRow key={list.id} list={list} onRename={handleRename} onDelete={handleDelete} />
              ))}
            </SortableContext>
          </ul>
        </DndContext>
      )}
      {!loading && lists.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">No scroll lists yet.</p>
      )}
    </div>
  )
}

function SortableListRow({
  list,
  onRename,
  onDelete,
}: {
  list: ScrollList
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: list.id })
  const [title, setTitle] = useState(list.title)

  useEffect(() => setTitle(list.title), [list.title])

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
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => onRename(list.id, title)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            e.currentTarget.blur()
          }
          if (e.key === 'Escape') setTitle(list.title)
        }}
        className="flex-1 min-w-0 px-2 py-1 rounded bg-transparent text-sm text-white border border-transparent hover:border-hotwheels-gray focus:border-hotwheels-red focus:bg-hotwheels-black outline-none"
        aria-label="Scroll list title"
      />
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {list.productCount} {list.productCount === 1 ? 'product' : 'products'}
      </span>
      <button onClick={() => onDelete(list.id)} className="text-xs text-red-400 hover:text-red-300">
        Delete
      </button>
    </li>
  )
}
