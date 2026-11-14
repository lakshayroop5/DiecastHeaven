import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, getPublishedProducts } from '@/lib/queries'
import WhatsAppCTA from '@/components/public/whatsapp-cta'
import AddToCartButton from '@/components/public/add-to-cart-button'
import RelatedProducts from '@/components/public/related-products'
import ProductImageGallery from '@/components/public/product-image-gallery'
import ProductViewTracker from '@/components/analytics/product-view-tracker'
import JsonLd from '@/components/seo/json-ld'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import {
  breadcrumbSchema,
  productSchema,
} from '@/lib/seo/schema'
import { SITE_NAME, absoluteUrl, truncate } from '@/lib/seo/site'
import type { ProductWithRelations } from '@/lib/types'
import type { Metadata } from 'next'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Product titles already contain the model and often the brand, so the brand is
 * only prepended when it is genuinely missing. That keeps "Hot Wheels Premium
 * Mercedes 300 SL" from becoming "Hotwheels Premium Hot Wheels Premium ...".
 */
function buildProductTitle(product: ProductWithRelations): string {
  const base = product.title.trim()
  const brand = product.brand?.name?.trim()
  const hasBrand = brand ? base.toLowerCase().includes(brand.toLowerCase()) : true

  let title = brand && !hasBrand ? `${brand} ${base}` : base

  if (product.scale && !title.toLowerCase().includes(product.scale.toLowerCase())) {
    title = `${title} (${product.scale})`
  }

  return title
}

/**
 * Description fallback ladder. `shortDesc` is frequently just the title repeated,
 * which is why the old version shipped 56-character descriptions identical to
 * the H1. Anything shorter than 40 characters, or equal to the title, is skipped.
 */
function buildProductDescription(product: ProductWithRelations): string {
  const candidates = [product.shortDesc, product.description]
    .map((value) => value?.replace(/\s+/g, ' ').trim() ?? '')
    .filter((value) => value.length >= 40 && value.toLowerCase() !== product.title.toLowerCase())

  if (candidates.length) return truncate(candidates[0], 158)

  const brand = product.brand?.name
  const scale = product.scale ? ` in ${product.scale} scale` : ''

  return truncate(
    `Buy the ${product.title}${brand ? ` by ${brand}` : ''}${scale} at ${SITE_NAME}. ` +
      `Genuine diecast collector car, carefully checked and packed, shipping across India. ` +
      `Message us on WhatsApp to confirm availability and price.`,
    158
  )
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Product not found',
      robots: { index: false, follow: true },
    }
  }

  const title = buildProductTitle(product)
  const description = buildProductDescription(product)
  const canonical = `/product/${product.slug}`
  const image = product.images[0]?.imageUrl ? absoluteUrl(product.images[0].imageUrl) : null

  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: absoluteUrl(canonical),
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      ...(image ? { images: [{ url: image, alt: title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      ...(image ? { images: [image] } : {}),
    },
    // Note: Open Graph product tags (og:type=product, product:price:amount) are
    // deliberately not emitted. Next 14's OpenGraphType union has no 'product'
    // and `other` renders name= rather than property=, so they would be invalid
    // markup. Price and availability are exposed in the Product JSON-LD instead,
    // which is the signal Google actually consumes.
  }
}

// Rendered on demand and cached at the edge; product edits invalidate the
// `products` tag via /api/revalidate. `force-dynamic` was re-rendering every
// product page on every request, which cost TTFB and crawl budget.
export const revalidate = 300

/**
 * Prerenders every published product at build time so crawlers get static HTML.
 * New products render on demand (`dynamicParams` defaults to true) and are then
 * cached by the `revalidate` window above.
 */
export async function generateStaticParams() {
  const products = await getPublishedProducts()
  return products.map((product) => ({ slug: product.slug }))
}

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

  // Breadcrumb trail mirrors the visible nav so the markup and the UI agree.
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Catalog', path: '/catalog' },
    ...(product.brand
      ? [{ name: product.brand.name, path: `/brands/${product.brand.slug}` }]
      : []),
    { name: product.title, path: `/product/${product.slug}` },
  ]

  const specs = [
    product.brand ? { label: 'Brand', value: product.brand.name } : null,
    product.scale ? { label: 'Scale', value: product.scale } : null,
    product.categories.length
      ? { label: 'Category', value: product.categories.map(({ category }) => category.name).join(', ') }
      : null,
    {
      label: 'Availability',
      value:
        product.status === 'SOLD_OUT'
          ? 'Sold out'
          : product.orderType === 'PRE_ORDER'
            ? 'Pre-order'
            : 'In stock',
    },
  ].filter((spec): spec is { label: string; value: string } => spec !== null)

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <JsonLd data={[productSchema(product), breadcrumbSchema(breadcrumbItems)]} />
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
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-400">
          <Link href="/" className="hover:text-hotwheels-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/catalog" className="hover:text-hotwheels-white transition-colors">Catalog</Link>
          {product.brand && (
            <>
              <span className="mx-2">/</span>
              <Link
                href={`/brands/${product.brand.slug}`}
                className="hover:text-hotwheels-white transition-colors"
              >
                {product.brand.name}
              </Link>
            </>
          )}
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

            {/* Specifications - real data only, and it lifts these pages out of thin content */}
            {specs.length > 0 && (
              <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-4 border-b border-[#2D2D2D] py-1.5">
                    <dt className="text-gray-400">{spec.label}</dt>
                    <dd className="text-hotwheels-white text-right">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}

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
