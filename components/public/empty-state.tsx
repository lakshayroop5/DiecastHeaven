'use client'

import { Search } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: 'search'
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ 
  title, 
  description, 
  icon = 'search',
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-hotwheels-gray p-6 mb-4">
        <Search className="h-12 w-12 text-hotwheels-red" />
      </div>
      <h3 className="text-lg font-semibold text-hotwheels-white mb-2">
        {title}
      </h3>
      <p className="text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-md bg-hotwheels-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}