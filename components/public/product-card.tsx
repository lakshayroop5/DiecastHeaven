'use client'

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
  const mainImage = product.images[0]
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

  return (
    <article className={`group relative flex flex-col h-full rounded-lg overflow-hidden border transition-all duration-300 animate-fade-in ${
      isPreOrder
        ? 'bg-[#1A1A1A] border-hotwheels-yellow/30 hover:border-hotwheels-yellow/60'
        : 'bg-[#1A1A1A] border-[#2D2D2D] hover:border-hotwheels-red/50 hover:shadow-[0_0_20px_rgba(230,0,0,0.3)]'
    }`}>
      {/* Gloss sheen overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />

      <Link href={`/product/${product.slug}`} onClick={trackProductClick}>
        <figure className="aspect-square relative bg-hotwheels-black overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage.imageUrl}
              alt={mainImage.altText || product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority={priority}
            />
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
