import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductBySlug, getRelatedProducts } from '@/lib/queries'
import WhatsAppCTA from '@/components/public/whatsapp-cta'
import ProductCard from '@/components/public/product-card'
import { Badge } from '@/components/ui/badge'
import type { Metadata } from 'next'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: `${product.title} | Hot Wheels Collector`,
    description: product.shortDesc || product.description?.substring(0, 160) || 'Hot Wheels collector car',
    openGraph: {
      images: product.images[0]?.imageUrl ? [product.images[0].imageUrl] : undefined,
    },
  }
}

export const revalidate = 3600 // ISR

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, product.id, 4)
  const mainImage = product.images[0]

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image Gallery */}
          <ProductImageGallery images={product.images} title={product.title} />
          
          {/* Product Details */}
          <ProductDetails 
            product={product} 
            relatedProducts={relatedProducts} 
          />
        </div>
      </div>
    </div>
  )
}

// Extracted component for image gallery
function ProductImageGallery({ 
  images, 
  title 
}: { 
  images: Array<{ imageUrl: string; altText: string | null }>
  title: string 
}) {
  const mainImage = images[0]
  
  return (
    <div className="flex flex-col">
      <div className="aspect-square relative bg-hotwheels-gray rounded-lg overflow-hidden mb-4">
        {mainImage ? (
          <Image
            src={mainImage.imageUrl}
            alt={mainImage.altText || title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-hotwheels-black flex items-center justify-center">
            <span className="text-gray-500">No image available</span>
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div 
              key={image.imageUrl} 
              className="aspect-square relative bg-hotwheels-gray rounded overflow-hidden cursor-pointer hover:opacity-80"
            >
              <Image
                src={image.imageUrl}
                alt={image.altText || `${title} view ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Extracted component for product details
function ProductDetails({ 
  product, 
  relatedProducts 
}: { 
  product: Awaited<ReturnType<typeof getProductBySlug>>
  relatedProducts: Awaited<ReturnType<typeof getRelatedProducts>>
}) {
  if (!product) return null

  return (
    <>
      <div className="mt-10 lg:mt-0 lg:pl-8">
        <ProductBadges product={product} />
        
        <h1 className="text-3xl font-bold text-hotwheels-white">
          {product.title}
        </h1>

        <ProductInfo product={product} />

        <div className="mt-8">
          <WhatsAppCTA productName={product.title} variant="primary" />
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </>
  )
}

// Extracted component for badges
function ProductBadges({ product }: { product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>> }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Badge variant="outline" className="border-hotwheels-red text-hotwheels-red">
        {product.category?.name}
      </Badge>
      {product.status === 'SOLD_OUT' && (
        <Badge variant="destructive">Sold Out</Badge>
      )}
    </div>
  )
}

// Extracted component for product info
function ProductInfo({ product }: { product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>> }) {
  return (
    <>
      {product.shortDesc && (
        <p className="mt-4 text-lg text-gray-300">{product.shortDesc}</p>
      )}

      {product.priceText && (
        <p className="mt-4 text-2xl font-bold text-hotwheels-yellow">
          {product.priceText}
        </p>
      )}

      {product.description && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-hotwheels-white mb-2">
            Description
          </h2>
          <p className="text-gray-300 whitespace-pre-wrap">
            {product.description}
          </p>
        </div>
      )}
    </>
  )
}

// Extracted component for related products
function RelatedProducts({ products }: { products: Awaited<ReturnType<typeof getRelatedProducts>> }) {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-hotwheels-white mb-6">
        Related Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((relatedProduct) => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} />
        ))}
      </div>
    </div>
  )
}