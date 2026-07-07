'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@prisma/client'
import WhatsAppCTA from './whatsapp-cta'
import AddToCartButton from './add-to-cart-button'
import { formatPrice } from '@/lib/utils'

interface ProductWithImages extends Product {
  brand: { name: string; slug: string } | null
  categories: Array<{ category: { name: string; slug: string } }>
  images: Array<{ imageUrl: string; altText: string | null }>
}

interface ProductCardProps {
  product: ProductWithImages
}

export default function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0]
  const hasDiscount = product.offerPrice != null && product.price != null && product.offerPrice < product.price
  const discountPct = hasDiscount ? Math.round(((product.price! - product.offerPrice!) / product.price!) * 100) : 0
  const isSoldOut = product.status === 'SOLD_OUT'

  return (
    <article className="group relative bg-hotwheels-gray rounded-lg overflow-hidden border border-hotwheels-black hover:border-hotwheels-red/50 transition-colors animate-fade-in">
      <Link href={`/product/${product.slug}`}>
        <figure className="aspect-square relative bg-hotwheels-black overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage.imageUrl}
              alt={mainImage.altText || product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-hotwheels-black flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}

          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-hotwheels-red text-white text-xs font-bold px-2 py-1 rounded">
              {discountPct}% off
            </div>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-base tracking-wider uppercase bg-black/60 px-3 py-1 rounded">Sold Out</span>
            </div>
          )}
        </figure>
      </Link>

      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs font-medium text-hotwheels-yellow uppercase tracking-wide mb-1">
            {product.brand.name}
          </p>
        )}

        {/* Title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-lg font-semibold text-hotwheels-white group-hover:text-hotwheels-yellow transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Category Badges */}
        {product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.categories.slice(0, 3).map(({ category }) => (
              <span
                key={category.slug}
                className="text-xs bg-hotwheels-black text-gray-300 px-2 py-0.5 rounded-full border border-hotwheels-gray"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        {/* Scale */}
        {product.scale && (
          <p className="text-xs text-gray-500 mt-1.5">
            Scale: {product.scale}
          </p>
        )}

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          {product.offerPrice != null && (
            <span className="text-lg font-bold text-hotwheels-yellow">
              {formatPrice(product.offerPrice)}
            </span>
          )}
          {hasDiscount && product.price != null && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.price)}
            </span>
          )}
          {!hasDiscount && product.price != null && (
            <span className="text-lg font-bold text-hotwheels-yellow">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Short Description */}
        {product.shortDesc && (
          <p className="mt-2 text-sm text-gray-300 line-clamp-2">
            {product.shortDesc}
          </p>
        )}

        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <AddToCartButton product={{ id: product.id, slug: product.slug, title: product.title, price: product.price, offerPrice: product.offerPrice }} imageUrl={mainImage?.imageUrl} variant="compact" />
          <WhatsAppCTA productName={product.title} variant="small" />
        </div>
      </div>
    </article>
  )
}
