import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProductBySlug } from '@/lib/queries'
import WhatsAppCTA from '@/components/public/whatsapp-cta'
import AddToCartButton from '@/components/public/add-to-cart-button'
import RelatedProducts from '@/components/public/related-products'
import ProductImageGallery from '@/components/public/product-image-gallery'
import ProductViewTracker from '@/components/analytics/product-view-tracker'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
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
    title: `${product.title} | ${process.env.DEFAULT_BUSINESS_NAME || 'Diecast Heaven Udaipur'}`,
    description:
      product.shortDesc ||
      product.description?.substring(0, 160) ||
      'Diecast collector car',
    openGraph: {
      images: product.images[0]?.imageUrl
        ? [product.images[0].imageUrl]
        : undefined,
    },
  }
}

export const dynamic = 'force-dynamic'

function RelatedSkeleton() {
  return (
    <div className="mt-10 sm:mt-16">
      <div className="h-7 bg-hotwheels-gray rounded w-48 animate-pulse mb-4 sm:mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-hotwheels-gray rounded-lg overflow-hidden border border-hotwheels-black">
            <div className="aspect-square bg-hotwheels-black animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-3 bg-hotwheels-black rounded w-1/3 animate-pulse" />
              <div className="h-5 bg-hotwheels-black rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-hotwheels-black rounded w-1/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const categoryIds = product.categories.map((pc) => pc.category.id)
  const hasDiscount = product.offerPrice != null && product.price != null && product.offerPrice < product.price
  const discountPct = hasDiscount ? Math.round(((product.price! - product.offerPrice!) / product.price!) * 100) : 0

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <ProductViewTracker
        product={{
          id: product.id,
          slug: product.slug,
          title: product.title,
          featured: product.featured,
          orderType: product.orderType,
          brandName: product.brand?.name,
          categoryName: product.categories[0]?.category.name,
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-400">
          <Link href="/" className="hover:text-hotwheels-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/catalog" className="hover:text-hotwheels-white transition-colors">Catalog</Link>
          <span className="mx-2">/</span>
          <span className="text-hotwheels-white">{product.title}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image Gallery */}
          <ProductImageGallery images={product.images} title={product.title} isSoldOut={product.status === 'SOLD_OUT'} />

          {/* Product Details */}
          <div className="mt-6 sm:mt-10 lg:mt-0 lg:pl-8">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.brand && (
                <Badge variant="outline" className="border-hotwheels-yellow text-hotwheels-yellow">
                  {product.brand.name}
                </Badge>
              )}
              {product.categories.map(({ category }) => (
                <Badge
                  key={category.id}
                  variant="outline"
                  className="border-hotwheels-red text-hotwheels-red"
                >
                  {category.name}
                </Badge>
              ))}
              {product.orderType === 'PRE_ORDER' && (
                <Badge variant="outline">Pre-Order</Badge>
              )}
              {product.status === 'SOLD_OUT' && (
                <Badge variant="destructive">Sold Out</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-hotwheels-white">
              {product.title}
            </h1>

            {/* Scale */}
            {product.scale && (
              <p className="mt-2 text-sm text-gray-400">
                Scale: {product.scale}
              </p>
            )}

            {/* Short Desc */}
            {product.shortDesc && (
              <p className="mt-4 text-base sm:text-lg text-gray-300">{product.shortDesc}</p>
            )}

            {/* Price */}
            <div className="mt-4 sm:mt-6 flex items-baseline gap-3 flex-wrap">
              {product.offerPrice != null && (
                <span className="text-2xl sm:text-3xl font-bold text-hotwheels-yellow">
                  {formatPrice(product.offerPrice)}
                </span>
              )}
              {product.price != null && (
                <span
                  className={`text-lg sm:text-xl ${
                    hasDiscount
                      ? 'text-gray-500 line-through'
                      : 'text-hotwheels-yellow font-bold'
                  }`}
                >
                  {formatPrice(product.price)}
                </span>
              )}
              {hasDiscount && (
                <span className="text-sm font-semibold text-hotwheels-red">
                  {discountPct}% off
                </span>
              )}
            </div>

            {/* Description */}
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

            {/* Pre-Order Deposit Note */}
            {product.orderType === 'PRE_ORDER' && product.depositAmount != null && (
              <div className="mt-4 p-3 rounded bg-hotwheels-yellow/10 border border-hotwheels-yellow/30 text-sm text-hotwheels-yellow">
                Pay {formatPrice(product.depositAmount)} deposit now — balance on delivery.
              </div>
            )}

            {/* CTA */}
            <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4 flex-wrap">
              {product.status !== 'SOLD_OUT' && (
                <AddToCartButton
                  product={product}
                  imageUrl={product.images[0]?.imageUrl}
                  variant="full"
                />
              )}
              <WhatsAppCTA productName={product.title} variant="primary" />
              <Link
                href="/catalog"
                className="rounded-md border border-hotwheels-gray px-5 py-3 text-sm font-semibold text-hotwheels-white hover:bg-hotwheels-gray transition-colors"
              >
                Back to Catalog
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products — streams via Suspense */}
        <Suspense fallback={<RelatedSkeleton />}>
          <RelatedProducts categoryIds={categoryIds} excludeProductId={product.id} />
        </Suspense>
      </div>
    </div>
  )
}
