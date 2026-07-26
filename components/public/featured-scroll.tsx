'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '@prisma/client'
import ProductCard from './product-card'

interface ProductWithImages extends Product {
  brand: { name: string; slug: string } | null
  categories: Array<{ category: { name: string; slug: string } }>
  images: Array<{ imageUrl: string; altText: string | null }>
}

export default function FeaturedScroll({ products }: { products: ProductWithImages[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>(':scope > div')
    if (!card) return
    el.scrollBy({ left: dir === 'left' ? -(card.offsetWidth + 24) : card.offsetWidth + 24, behavior: 'smooth' })
  }

  return (
    <div className="relative group/scroll">
      {/* Left arrow — hidden until scrolled */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 bg-hotwheels-gray/90 hover:bg-hotwheels-red text-white rounded-full p-2 shadow-lg border border-hotwheels-black opacity-0 group-hover/scroll:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Right arrow — always visible when scrollable to hint at more content */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 bg-hotwheels-red text-white rounded-full p-2.5 shadow-lg transition-transform group-hover/scroll:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Right edge fade gradient — desktop/tablet only */}
      {canScrollRight && (
        <div className="hidden sm:block absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-hotwheels-black to-transparent pointer-events-none z-[1]" />
      )}

      {/* Mobile hint — subtle right fade so users sense more content */}
      <div className="sm:hidden absolute right-0 top-0 bottom-4 w-10 bg-gradient-to-l from-hotwheels-black/80 to-transparent pointer-events-none z-[1]" />

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {products.map((product, index) => (
          <div key={product.id} className="flex-none w-[160px] sm:w-[calc((100%-48px)/3)] sm:min-w-[260px] snap-start">
            <ProductCard product={product} priority={index < 3} />
          </div>
        ))}
      </div>
    </div>
  )
}
