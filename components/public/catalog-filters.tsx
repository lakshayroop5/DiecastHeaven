'use client'

import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import PillFilter from './pill-filter'

interface FilterItem { id: string; name: string; slug: string }

interface CatalogFiltersProps {
  categories: FilterItem[]
  brands: FilterItem[]
  showBrandView: boolean
  // count of active filters, to badge the button
  activeCount: number
}

export default function CatalogFilters({ categories, brands, showBrandView, activeCount }: CatalogFiltersProps) {
  const [open, setOpen] = useState(false)

  const FilterBody = (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-hotwheels-yellow mb-2">Type</h2>
        <PillFilter items={[{ id: 'RTD', name: 'RTD', slug: 'RTD' }, { id: 'PRE_ORDER', name: 'Pre-Order', slug: 'PRE_ORDER' }]} param="orderType" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-hotwheels-yellow mb-2">Categories</h2>
        <PillFilter items={categories} param="category" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-hotwheels-yellow mb-2">Brands</h2>
        {showBrandView ? (
          <PillFilter items={brands} param="brand" layout="grid" />
        ) : (
          <PillFilter items={brands} param="brand" />
        )}
      </div>
    </div>
  )

  return (
    <div>
      {/* Mobile: toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden mb-4 w-full inline-flex items-center justify-center gap-2 rounded-md border border-hotwheels-gray bg-hotwheels-gray px-4 py-3 text-sm font-semibold text-hotwheels-white hover:border-hotwheels-yellow/50 transition-colors"
        aria-expanded={open}
      >
        {open ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center rounded-full bg-hotwheels-red text-white text-xs font-bold w-5 h-5">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile: collapsible panel */}
      {open && (
        <div className="lg:hidden mb-4 rounded-lg border border-hotwheels-gray bg-hotwheels-black/60 p-4">
          {FilterBody}
        </div>
      )}

      {/* Desktop/tablet: always visible */}
      <div className="hidden lg:block">
        {FilterBody}
      </div>
    </div>
  )
}
