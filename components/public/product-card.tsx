'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@prisma/client'
import WhatsAppCTA from './whatsapp-cta'

interface ProductWithImages extends Product {
  images: Array<{ imageUrl: string; altText: string | null }>
  category: { name: string; slug: string } | null
}

interface ProductCardProps {
  product: ProductWithImages
}

export default function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0]

  return (
    <article className="group relative bg-hotwheels-gray rounded-lg overflow-hidden border border-hotwheels-black hover:border-hotwheels-red/50 transition-colors">
      <Link href={`/product/${product.slug}`}>
        <figure className="aspect-square relative bg-hotwheels-black overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage.imageUrl}
              alt={mainImage.altText || product.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-hotwheels-black flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}
        </figure>
      </Link>
      
      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-lg font-semibold text-hotwheels-white group-hover:text-hotwheels-yellow transition-colors">
            {product.title}
          </h3>
        </Link>
        
        <p className="mt-1 text-sm text-gray-400">
          {product.category?.name}
        </p>
        
        {product.priceText && (
          <p className="mt-2 text-hotwheels-yellow font-medium">
            {product.priceText}
          </p>
        )}
        
        {product.shortDesc && (
          <p className="mt-2 text-sm text-gray-300 line-clamp-2">
            {product.shortDesc}
          </p>
        )}
        
        <div className="mt-4">
          <WhatsAppCTA 
            productName={product.title} 
            variant="small"
          />
        </div>
      </div>
    </article>
  )
}