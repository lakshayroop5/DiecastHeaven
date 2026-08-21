'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import ProductCard from './product-card'
import type { ProductWithRelations } from '@/lib/types'

interface ProductGridProps {
  initialProducts: ProductWithRelations[]
  initialPage: number
  total: number
  totalPages: number
  search?: string
  categorySlug?: string
  brandSlug?: string
  orderType?: string
}

export default function ProductGrid({
  initialProducts,
  initialPage,
  total,
  totalPages,
  search,
  categorySlug,
  brandSlug,
  orderType,
}: ProductGridProps) {
  const [products, setProducts] = useState<ProductWithRelations[]>(initialProducts)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPage < totalPages)
  const [error, setError] = useState<string | null>(null)

  // Guards so we never fire two in-flight requests at once.
  const loadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchMore = useCallback(async () => {
    if (loadingRef.current) return
    const nextPage = page + 1
    if (nextPage > totalPages) {
      setHasMore(false)
      return
    }

    loadingRef.current = true
    setLoading(true)
    setError(null)
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (categorySlug) params.set('category', categorySlug)
      if (brandSlug) params.set('brand', brandSlug)
      if (orderType) params.set('orderType', orderType)
      params.set('page', String(nextPage))

      const res = await fetch(`/api/catalog?${params.toString()}`, { signal: ac.signal })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()

      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        const merged = [...prev, ...data.products.filter((p: ProductWithRelations) => !seen.has(p.id))]
        return merged
      })
      setPage(data.page)
      setHasMore(data.page < data.totalPages)
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError('Could not load more products. Please try again.')
      }
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [page, totalPages, search, categorySlug, brandSlug, orderType])

  // Trigger loads as the sentinel scrolls into view (preload before the edge).
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          fetchMore()
        }
      },
      { rootMargin: '800px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, fetchMore])

  // Safety net: if the page is short and the sentinel is already within view
  // after a load (or on mount), keep loading until the viewport fills or ends.
  useEffect(() => {
    if (loading || !hasMore) return
    const el = sentinelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    if (rect.top <= vh + 800) {
      fetchMore()
    }
  }, [loading, hasMore, products, fetchMore])

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">
          {search ? `No products match "${search}"` : 'No products available'}
        </p>
        {!search && <p className="text-gray-500 text-sm mt-2">Check back soon for new arrivals!</p>}
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 3}
          />
        ))}
      </div>

      {/* Sentinel + status row */}
      <div className="mt-10 flex flex-col items-center gap-4">
        {hasMore && (
          <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
        )}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-gray-400" role="status" aria-live="polite">
            <span className="h-4 w-4 rounded-full border-2 border-hotwheels-gray border-t-hotwheels-red animate-spin" />
            Loading more products…
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={fetchMore}
              className="px-5 py-2.5 rounded-full bg-hotwheels-gray text-gray-300 text-sm font-medium hover:bg-hotwheels-black hover:text-hotwheels-white transition-colors border border-hotwheels-gray hover:border-hotwheels-red"
            >
              Try again
            </button>
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <p className="text-sm text-gray-500">
            You&apos;ve seen all {total} products
          </p>
        )}

        {/* Manual fallback / accessibility trigger */}
        {hasMore && !loading && (
          <button
            onClick={fetchMore}
            className="px-5 py-2.5 rounded-full bg-hotwheels-gray text-gray-300 text-sm font-medium hover:bg-hotwheels-black hover:text-hotwheels-white transition-colors border border-hotwheels-gray hover:border-hotwheels-red"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  )
}
