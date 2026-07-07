'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddForm({ placeholder, onAdd }: { placeholder: string; onAdd: (name: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onAdd(name.trim())
    setName('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholder}
        className="flex-1 px-3 py-2 rounded bg-hotwheels-black text-white border border-hotwheels-gray text-sm outline-none focus:border-hotwheels-red" />
      <button type="submit" disabled={loading} className="px-4 py-2 bg-hotwheels-red text-white rounded text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
        Add
      </button>
    </form>
  )
}
