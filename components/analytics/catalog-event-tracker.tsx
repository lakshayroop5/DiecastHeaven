'use client'

import { useEffect } from 'react'
import { track } from '@/lib/track'

interface CatalogEventTrackerProps {
  search?: string
  category?: string
  brand?: string
  orderType?: string
}

/**
 * Mounted in the catalog page. Every filter/search change lands as new
 * searchParams, so one mount point captures SEARCH + FILTER_APPLY without
 * touching CatalogFilters/PillFilter.
 */
export default function CatalogEventTracker({
  search,
  category,
  brand,
  orderType,
}: CatalogEventTrackerProps) {
  useEffect(() => {
    if (search) track({ eventType: 'SEARCH', searchQuery: search, source: 'catalog' })
    const filters: string[] = []
    if (orderType) filters.push(`orderType:${orderType}`)
    if (category) filters.push(`category:${category}`)
    if (brand) filters.push(`brand:${brand}`)
    if (filters.length > 0) {
      track({ eventType: 'FILTER_APPLY', meta: filters.join('|'), searchQuery: search, source: 'catalog' })
    }
  }, [search, category, brand, orderType])

  return null
}
