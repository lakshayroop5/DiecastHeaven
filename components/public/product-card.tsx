'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@prisma/client'
import WhatsAppCTA from './whatsapp-cta'
import AddToCartButton from './add-to-cart-button'
import { formatPrice } from '@/lib/utils'
import { track } from '@/lib/track'

interface ProductWithImages extends Product {
  brand: { name: string; slug: string } | null
  categories: Array<{ category: { name: string; slug: string } }>
  images: Array<{ imageUrl: string; altText: string | null }>
}

interface ProductCardProps {
  product: ProductWithImages
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const images = product.images || []
  const [idx, setIdx] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const touchX = useRef<number | null>(null)
  const mouseX = useRef<number | null>(null)
  const justDragged = useRef(false)
  const pauseUntil = useRef(0)
  const [touching, setTouching] = useState(false)
  const mainImage = images[idx] || images[0]

  const poke = () => { pauseUntil.current = Date.now() + 6000 }
  const go = (dir: 1 | -1) => { poke(); setIdx((i) => (i + dir + images.length) % images.length) }
  const hasDiscount = product.offerPrice != null && product.price != null && product.offerPrice < product.price
  const discountPct = hasDiscount ? Math.round(((product.price! - product.offerPrice!) / product.price!) * 100) : 0
  const isSoldOut = product.status === 'SOLD_OUT'
  const isPreOrder = product.orderType === 'PRE_ORDER'

  const trackProductClick = () => {
    const path = window.location.pathname
    const source = path === '/' ? 'featured' : path.startsWith('/product/') ? 'related' : 'catalog'
    track({
      eventType: 'PRODUCT_CLICK',
      productId: product.id,
      productSlug: product.slug,
      productTitle: product.title,
      featured: product.featured,
      orderType: product.orderType,
      brand: product.brand?.name,
      category: product.categories[0]?.category.name,
      source,
    })
  }

  // ponytail: auto-cycle images only while card visible, pause on hover + reduced-motion
  useEffect(() => {
    const el = ref.current
    if (!el || images.length < 2) return
    const obs = new IntersectionObserver(([e]) => setIsVisible(e.isIntersecting), { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [images.length])

  useEffect(() => {
    if (!isVisible || isHovered || touching || images.length < 2) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => {
      if (Date.now() < pauseUntil.current) return
      setIdx((i) => (i + 1) % images.length)
    }, 2500)
    return () => clearInterval(t)
  }, [isVisible, isHovered, touching, images.length])

  return (
    <article ref={ref} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className={`group relative flex flex-col h-full rounded-lg overflow-hidden border transition-all duration-300 animate-fade-in ${
      isPreOrder
        ? 'bg-[#1A1A1A] border-hotwheels-yellow/30 hover:border-hotwheels-yellow/60'
        : 'bg-[#1A1A1A] border-[#2D2D2D] hover:border-hotwheels-red/50 hover:shadow-[0_0_20px_rgba(230,0,0,0.3)]'
    }`}>
      {/* Gloss sheen overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />

      <div className="relative">
      <Link href={`/product/${product.slug}`} onClick={trackProductClick}
        onClickCapture={(e) => { if (justDragged.current) { e.preventDefault(); justDragged.current = false } }}>
        <figure className="aspect-square relative bg-hotwheels-black overflow-hidden select-none"
          onTouchStart={(e) => { setTouching(true); touchX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            setTouching(false)
            if (touchX.current == null || images.length < 2) return
            const dx = e.changedTouches[0].clientX - touchX.current
            touchX.current = null
            if (Math.abs(dx) < 40) return
            go(dx < 0 ? 1 : -1)
          }}
          onMouseDown={(e) => { if (e.button === 0 && images.length > 1) mouseX.current = e.clientX }}
          onMouseUp={(e) => {
            if (mouseX.current == null || images.length < 2) return
            const dx = e.clientX - mouseX.current
            mouseX.current = null
            if (Math.abs(dx) < 40) return
            justDragged.current = true
            go(dx < 0 ? 1 : -1)
          }}
          onMouseLeave={() => { mouseX.current = null }}>
          {images.length ? (
            <div className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translateX(-${idx * 100}%)` }}>
              {images.map((img, i) => (
                <div key={img.imageUrl + i} className="relative w-full h-full flex-shrink-0">
                  <Image
                    src={img.imageUrl}
                    alt={img.altText || product.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                    priority={priority && i === 0}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full bg-hotwheels-black flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}
          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 max-w-[55%] z-20">
            {isPreOrder && (
              <span className="bg-hotwheels-yellow text-hotwheels-black text-[9px] sm:text-[11px] font-bold px-1 sm:px-2 py-0.5 sm:py-1 uppercase tracking-widest leading-none">
                PRE-ORDER
              </span>
            )}
            {hasDiscount && (
              <span className="bg-hotwheels-red text-white text-[9px] sm:text-[11px] font-bold px-1 sm:px-2 py-0.5 sm:py-1 uppercase tracking-widest leading-none">
                {discountPct}% OFF
              </span>
            )}
          </div>

          {/* Scale pill badge */}
          {product.scale && (
            <span className="absolute bottom-2 right-2 sm:top-3 sm:bottom-auto sm:right-3 bg-hotwheels-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-[#2D2D2D] z-20">
              SCALE {product.scale}
            </span>
          )}

          {/* Sold out overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px] z-20">
              <span className="text-white font-bold text-sm sm:text-base tracking-wider uppercase bg-black/70 px-4 py-1.5 rounded">
                Sold Out
              </span>
            </div>
          )}

          {/* Ground shadow */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/40 blur-xl rounded-[100%]" />
        </figure>
      </Link>
      {images.length > 1 && (
        <>
          <button type="button" aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); go(-1) }}
            className="absolute left-2.5 top-[calc(50%-1rem)] z-20 h-9 w-9 rounded-full bg-black/55 text-white backdrop-blur-md border border-white/15 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-200 hover:bg-black/85 hover:scale-105 active:scale-95">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button type="button" aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); go(1) }}
            className="absolute right-2.5 top-[calc(50%-1rem)] z-20 h-9 w-9 rounded-full bg-black/55 text-white backdrop-blur-md border border-white/15 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-200 hover:bg-black/85 hover:scale-105 active:scale-95">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-black/45 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
            {images.map((_, i) => (
              <button key={i} type="button" aria-label={`View image ${i + 1}`}
                onClick={(e) => { e.stopPropagation(); poke(); setIdx(i) }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-white w-5' : 'bg-white/40 w-1.5 hover:bg-white/70'}`} />
            ))}
          </div>
        </>
      )}
      </div>

      <div className="p-4 flex-1 flex flex-col relative z-20">
        {/* Brand */}
        {product.brand && (
          <p className="text-[11px] font-bold text-hotwheels-yellow uppercase tracking-widest italic mb-1">
            {product.brand.name}
          </p>
        )}

        {/* Title */}
        <Link href={`/product/${product.slug}`} onClick={trackProductClick}>
          <h3 className="text-base font-bold text-white uppercase italic leading-tight group-hover:text-hotwheels-yellow transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Category Badges */}
        {product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.categories.slice(0, 3).map(({ category }) => (
              <span
                key={category.slug}
                className="text-[10px] bg-hotwheels-black text-gray-300 px-2 py-0.5 rounded-full border border-[#2D2D2D]"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        {/* Short Description */}
        {product.shortDesc && (
          <p className="mt-2 text-xs text-gray-400 line-clamp-2">
            {product.shortDesc}
          </p>
        )}

        {/* Price Section */}
        <div className="mt-3 flex items-end justify-between border-t border-[#2D2D2D] pt-3">
          <div className="flex flex-col">
            {isPreOrder && product.depositAmount != null ? (
              <>
                {product.price != null && (
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
                <span className="text-xl font-black text-white leading-none tracking-tighter">
                  {formatPrice(product.offerPrice)}
                </span>
              </>
            ) : (
              <>
                {hasDiscount && product.price != null && (
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
                <span className="text-xl font-black text-white leading-none tracking-tighter">
                  {product.offerPrice != null
                    ? formatPrice(product.offerPrice)
                    : product.price != null
                      ? formatPrice(product.price)
                      : 'Price TBD'}
                </span>
              </>
            )}
          </div>

          {isPreOrder && product.depositAmount != null && product.price != null && (
            <div className="text-right">
              <span className="block text-hotwheels-yellow text-[11px] font-bold uppercase">Deposit</span>
              <span className="text-white text-sm font-bold">{formatPrice(product.depositAmount)}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {!isSoldOut && (
            <AddToCartButton
              product={{ id: product.id, slug: product.slug, title: product.title, price: product.price, offerPrice: product.offerPrice, depositAmount: product.depositAmount, orderType: product.orderType }}
              imageUrl={mainImage?.imageUrl}
              variant="compact"
            />
          )}
          <WhatsAppCTA productName={product.title} variant="small" />
        </div>
      </div>
    </article>
  )
}
