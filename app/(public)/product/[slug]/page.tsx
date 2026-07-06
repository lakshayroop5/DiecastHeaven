import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, getRelatedProducts } from '@/lib/queries'
import WhatsAppCTA from '@/components/public/whatsapp-cta'
import AddToCartButton from '@/components/public/add-to-cart-button'
import ProductCard from '@/components/public/product-card'
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
    title: `${product.title} | ${process.env.DEFAULT_BUSINESS_NAME || 'Diecast Heaven'}`,
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const categoryIds = product.categories.map((pc) => pc.category.id)
  const relatedProducts = await getRelatedProducts(categoryIds, product.id, 4)
  const mainImage = product.images[0]

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-hotwheels-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/catalog" className="hover:text-hotwheels-white transition-colors">Catalog</Link>
          <span className="mx-2">/</span>
          <span className="text-hotwheels-white">{product.title}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image Gallery */}
          <ProductImageGallery images={product.images} title={product.title} />

          {/* Product Details */}
          <div className="mt-10 lg:mt-0 lg:pl-8">
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
              {product.status === 'SOLD_OUT' && (
                <Badge variant="destructive">Sold Out</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-hotwheels-white">
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
              <p className="mt-4 text-lg text-gray-300">{product.shortDesc}</p>
            )}

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              {product.offerPrice != null && (
                <span className="text-3xl font-bold text-hotwheels-yellow">
                  {formatPrice(product.offerPrice)}
                </span>
              )}
              {product.price != null && (
                <span
                  className={`text-xl ${
                    product.offerPrice != null && product.offerPrice < product.price
                      ? 'text-gray-500 line-through'
                      : 'text-hotwheels-yellow font-bold'
                  }`}
                >
                  {formatPrice(product.price)}
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

            {/* CTA */}
            <div className="mt-8 flex gap-4 flex-wrap">
              <AddToCartButton
                product={product}
                imageUrl={product.images[0]?.imageUrl}
                variant="full"
              />
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-hotwheels-white mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductImageGallery({
  images,
  title,
}: {
  images: Array<{ imageUrl: string; altText: string | null }>
  title: string
}) {
  const mainImage = images[0]

  return (
    <div className="flex flex-col">
      <div className="aspect-square relative bg-hotwheels-gray rounded-lg overflow-hidden mb-4">
        {mainImage ? (
          <img
            src={mainImage.imageUrl}
            alt={mainImage.altText || title}
            className="absolute inset-0 w-full h-full object-cover"
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
              <img
                src={image.imageUrl}
                alt={image.altText || `${title} view ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
