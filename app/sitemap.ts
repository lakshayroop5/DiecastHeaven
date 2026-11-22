import type { MetadataRoute } from 'next'
import { getPublishedProducts, getBrands, getCategories } from '@/lib/queries'
import { SITE_URL } from '@/lib/seo/site'
import { POLICIES } from '@/lib/policies'

/**
 * XML sitemap.
 *
 * Two things this fixes:
 * 1. URLs are built from `SITE_URL`, which falls back to the canonical www host.
 *    Previously `NEXT_PUBLIC_SITE_URL` was unset in production and every loc was
 *    `http://localhost:3000`.
 * 2. Brand and category landing pages are real crawlable routes now, so they are
 *    listed instead of the `/catalog?brand=` query-parameter duplicates.
 */

// Regenerated hourly so new products and landing pages enter the sitemap
// without waiting for the next deploy.
export const revalidate = 3600

// Static pages have no data-derived timestamp. A fixed value is honest; an
// always-"now" lastmod (the previous `new Date()` in a route that regenerates
// hourly) teaches crawlers to ignore lastmod for the whole sitemap.
// Bump this when the copy on /about, /contact or /policies changes.
const STATIC_CONTENT_UPDATED = new Date('2026-11-15')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, brands, categories] = await Promise.all([
    getPublishedProducts(),
    getBrands(),
    getCategories(),
  ])

  // The newest product update drives the freshness signal for collection pages.
  const newestProductUpdate = products.reduce<Date | null>((latest, product) => {
    const updated = new Date(product.updatedAt)
    if (!latest || updated > latest) return updated
    return latest
  }, null)

  const collectionLastModified = newestProductUpdate ?? STATIC_CONTENT_UPDATED

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: collectionLastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/catalog`,
      lastModified: collectionLastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/brands`,
      lastModified: collectionLastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: STATIC_CONTENT_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // A brand or category with no live products renders an empty page. Those must
  // not be advertised in the sitemap - an empty landing page is a quality signal
  // against the whole site.
  const brandsWithStock = new Set(
    products.map((product) => product.brand?.slug).filter((slug): slug is string => Boolean(slug))
  )
  const categoriesWithStock = new Set(
    products.flatMap((product) => product.categories.map(({ category }) => category.slug))
  )

  const brandRoutes: MetadataRoute.Sitemap = brands
    .filter((brand) => brandsWithStock.has(brand.slug))
    .map((brand) => ({
      url: `${SITE_URL}/brands/${brand.slug}`,
      lastModified: new Date(brand.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((category) => categoriesWithStock.has(category.slug))
    .map((category) => ({
      url: `${SITE_URL}/categories/${category.slug}`,
      lastModified: new Date(category.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Policy pages are static content with no per-page timestamp, so they share
  // the same fixed date as the other static routes.
  const policyRoutes: MetadataRoute.Sitemap = POLICIES.map(({ slug }) => ({
    url: `${SITE_URL}/policies/${slug}`,
    lastModified: STATIC_CONTENT_UPDATED,
    changeFrequency: 'yearly',
    priority: 0.3,
  }))

  return [
    ...staticRoutes,
    ...policyRoutes,
    ...brandRoutes,
    ...categoryRoutes,
    ...productRoutes,
  ]
}
