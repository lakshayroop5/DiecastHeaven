import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCategories, getPublishedProducts } from '@/lib/queries'
import JsonLd from '@/components/seo/json-ld'
import ProductCollection from '@/components/public/product-collection'
import { breadcrumbSchema, itemListSchema } from '@/lib/seo/schema'
import { SITE_NAME, SITE_URL, absoluteUrl, truncate } from '@/lib/seo/site'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

const MAX_RENDERED = 36

export const revalidate = 1800

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const categories = await getCategories()
  const category = categories.find((item) => item.slug === slug)

  if (!category) {
    return { title: 'Category not found', robots: { index: false, follow: true } }
  }

  const products = await getPublishedProducts()
  const count = products.filter((product) =>
    product.categories.some(({ category: c }) => c.slug === slug)
  ).length

  const title = `${category.name} Diecast Cars — Buy Online in India`
  const description = truncate(
    category.description ||
      `Shop ${category.name} diecast collector cars at ${SITE_NAME}. ${count} ${
        count === 1 ? 'model' : 'models'
      } available now with prices in INR, shipping across India. Order on WhatsApp.`,
    158
  )

  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    // No stock means no reason for this page to be in the index.
    ...(count === 0
      ? { robots: { index: false, follow: true } }
      : {}),
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/categories/${category.slug}`,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const [categories, products] = await Promise.all([getCategories(), getPublishedProducts()])

  const category = categories.find((item) => item.slug === slug)
  if (!category) notFound()

  const categoryProducts = products.filter((product) =>
    product.categories.some(({ category: c }) => c.slug === slug)
  )
  const visible = categoryProducts.slice(0, MAX_RENDERED)
  const hasMore = categoryProducts.length > visible.length

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Catalog', path: '/catalog' },
            { name: category.name, path: `/categories/${category.slug}` },
          ]),
          itemListSchema(visible, {
            url: absoluteUrl(`/categories/${category.slug}`),
            name: `${category.name} diecast cars`,
          }),
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs sm:text-sm text-gray-400">
          <Link href="/" className="hover:text-hotwheels-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/catalog" className="hover:text-hotwheels-white transition-colors">Catalog</Link>
          <span className="mx-2">/</span>
          <span className="text-hotwheels-white">{category.name}</span>
        </nav>

        <h1 className="text-3xl font-bold text-hotwheels-white mb-3">
          {category.name} Diecast Cars
        </h1>
        <p className="text-gray-400 max-w-3xl mb-10">
          {category.description ||
            `${categoryProducts.length} ${category.name.toLowerCase()} ${
              categoryProducts.length === 1 ? 'model' : 'models'
            } available at ${SITE_NAME}, with prices in INR and shipping across India.`}
        </p>

        <ProductCollection
          products={visible}
          moreHref={hasMore ? `/catalog?category=${category.slug}` : undefined}
          moreLabel={`View all ${categoryProducts.length} ${category.name} models`}
        />
      </div>
    </div>
  )
}
