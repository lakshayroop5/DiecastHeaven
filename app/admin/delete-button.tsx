'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteButton({ endpoint, label = 'Delete' }: { endpoint: string; label?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete?')) return
    setLoading(true)
    await fetch(endpoint, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-red-400 hover:underline text-sm disabled:opacity-50">
      {loading ? '...' : label}
    </button>
  )
}
