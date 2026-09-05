'use client'

import { useEffect, useRef } from 'react'
import { track } from '@/lib/track'

interface ProductViewData {
  id: string
  slug: string
  title: string
  featured: boolean
  orderType: string
  brandName?: string
  categoryName?: string
}

/**
 * Fires PRODUCT_VIEW once per product slug mount.
 * API-side dedup (same visitor + product, 24h) handles repeat visits.
 */
export default function ProductViewTracker({ product }: { product: ProductViewData }) {
  const last = useRef<string | null>(null)

  useEffect(() => {
    if (last.current === product.slug) return
    last.current = product.slug
    track({
      eventType: 'PRODUCT_VIEW',
      productId: product.id,
      productSlug: product.slug,
      productTitle: product.title,
      featured: product.featured,
      orderType: product.orderType,
      brand: product.brandName,
      category: product.categoryName,
      source: 'product-page',
    })
  }, [product])

  return null
}
