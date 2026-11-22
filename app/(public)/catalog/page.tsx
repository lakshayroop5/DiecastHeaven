import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategories, getBrands, getCatalogProducts } from '@/lib/queries'
import ProductGrid from '@/components/public/product-grid'
import CatalogFilters from '@/components/public/catalog-filters'
import CatalogEventTracker from '@/components/analytics/catalog-event-tracker'
import JsonLd from '@/components/seo/json-ld'
import { breadcrumbSchema, itemListSchema } from '@/lib/seo/schema'
import { SITE_LOCALE, SITE_NAME, SITE_URL, absoluteUrl, defaultOgImage, truncate } from '@/lib/seo/site'

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string
    brand?: string
    search?: string
    view?: string
    orderType?: string
    page?: string
  }>
}

type CatalogParams = Awaited<CatalogPageProps['searchParams']>

/**
 * Canonicalisation policy for a filtered catalogue.
 *
 * Every filter combination used to render the identical `<title>Diecast Heaven`
 * with no canonical, and Google indexed several of them. Now:
 * - brand / category / brand-index filters canonicalise onto their real landing
 *   pages, so link equity consolidates there instead of on a query string.
 * - internal search results are `noindex` (they are infinite duplicates).
 * - the plain catalogue is indexable and self-canonical.
 */
function parsePage(raw: string | undefined): number {
  const value = Number(raw)
  return Number.isInteger(value) && value > 1 ? value : 1
}

/** Preserve every active filter while moving to another page. */
function catalogHref(params: CatalogParams, page: number): string {
  const searchParams = new URLSearchParams()
  for (const key of ['search', 'category', 'brand', 'view', 'orderType'] as const) {
    const value = params[key]
    if (value) searchParams.set(key, value)
  }
  if (page > 1) searchParams.set('page', String(page))
  const query = searchParams.toString()
  return query ? `/catalog?${query}` : '/catalog'
}

function canonicalFor(
  params: CatalogParams,
  page: number,
  validBrands: Set<string>,
  validCategories: Set<string>
): { canonical: string; noindex: boolean } {
  const { search, brand, category, view } = params

  if (search) return { canonical: '/catalog', noindex: true }
  // This view renders the product grid, not the brand index; pointing a
  // canonical at /brands would describe different content.
  if (view === 'brands') return { canonical: '/catalog', noindex: true }
  if (brand) {
    return validBrands.has(brand)
      ? { canonical: `/brands/${brand}`, noindex: false }
      : { canonical: '/catalog', noindex: true }
  }
  if (category) {
    return validCategories.has(category)
      ? { canonical: `/categories/${category}`, noindex: false }
      : { canonical: '/catalog', noindex: true }
  }
  return { canonical: page > 1 ? `/catalog?page=${page}` : '/catalog', noindex: false }
}

/** Compact pagination trail: first, last, and neighbours of the current page. */
function pageWindow(current: number, total: number): Array<number | 'gap'> {
  const pages: Array<number | 'gap'> = []
  for (let page = 1; page <= total; page += 1) {
    if (page === 1 || page === total || Math.abs(page - current) <= 1) {
      pages.push(page)
    } else if (pages[pages.length - 1] !== 'gap') {
      pages.push('gap')
    }
  }
  return pages
}

/** Turns `hotwheels-premium` into `Hotwheels Premium` for headings and titles. */
function humanizeSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function catalogHeading(params: CatalogParams): string {
  const { search, brand, category, view, orderType } = params
  if (search) return `Search: "${search}"`
  if (brand) return `${humanizeSlug(brand)} diecast cars`
  if (category) return `${humanizeSlug(category)} diecast cars`
  if (view === 'brands') return 'Shop by Brand'
  if (orderType === 'PRE_ORDER') return 'Pre-order diecast cars'
  return 'Diecast Cars Catalog'
}

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const params = await searchParams
  const [brands, categories] = await Promise.all([getBrands(), getCategories()])
  const page = parsePage(params.page)
  const { canonical, noindex } = canonicalFor(
    params,
    page,
    new Set(brands.map((brand) => brand.slug)),
    new Set(categories.map((category) => category.slug))
  )
  const heading = catalogHeading(params)

  const description = truncate(
    `Browse ${SITE_NAME}'s diecast collector cars — Hot Wheels, Hot Wheels Premium, Majorette, Matchbox, Bburago, Tomica, Tarmac Works and Pop Race. Prices in INR, genuine models, shipping across India.`,
    158
  )

  return {
    title: { absolute: `${heading} | ${SITE_NAME}` },
    description,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      title: `${heading} | ${SITE_NAME}`,
      description,
      locale: SITE_LOCALE,
      images: [defaultOgImage()],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${heading} | ${SITE_NAME}`,
      description,
      images: [defaultOgImage().url],
    },
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const { category, brand, search, view, orderType } = params
  const page = parsePage(params.page)

  const [categories, brands, initial] = await Promise.all([
    getCategories(),
    getBrands(),
    getCatalogProducts({ search, categorySlug: category, brandSlug: brand, orderType, page }),
  ])

  // A page past the last one renders an empty grid, which Google reads as a
  // soft 404. `notFound()` here answers a real 404 because this route has no
  // `loading.tsx` to commit a 200 shell before the body renders.
  if (page > 1 && page > initial.totalPages) notFound()

  const showBrandView = view === 'brands'

  const activeFilterCount =
    (orderType ? 1 : 0) + (category ? 1 : 0) + (brand ? 1 : 0)

  // Remount the grid when filters or page change so it starts from fresh data.
  const gridKey =
    [search, category, brand, orderType, view, page].filter(Boolean).join('|') || 'all'

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Catalog', path: '/catalog' },
          ]),
          itemListSchema(initial.products, {
            url: absoluteUrl('/catalog'),
            name: 'Diecast cars catalog',
          }),
        ]}
      />
      <CatalogEventTracker search={search} category={category} brand={brand} orderType={orderType} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hotwheels-white mb-4">
            {catalogHeading(params)}
          </h1>
          <CatalogFilters
            categories={categories}
            brands={brands}
            showBrandView={showBrandView}
            activeCount={activeFilterCount}
          />
          {search && (
            <p className="mt-4 text-sm text-gray-400">
              Searching for &quot;{search}&quot;...
            </p>
          )}
        </div>

        <ProductGrid
          key={gridKey}
          initialProducts={initial.products}
          initialPage={page}
          total={initial.total}
          totalPages={initial.totalPages}
          search={search}
          categorySlug={category}
          brandSlug={brand}
          orderType={orderType}
        />

        {initial.totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            {page > 1 && (
              <Link
                href={catalogHref(params, page - 1)}
                className="rounded-md border border-white/10 px-3 py-2 text-sm text-gray-300 hover:border-white/30 hover:text-white transition-colors"
              >
                Previous
              </Link>
            )}
            {pageWindow(page, initial.totalPages).map((entry, index) =>
              entry === 'gap' ? (
                <span key={`gap-${index}`} className="px-2 text-sm text-gray-500">
                  …
                </span>
              ) : (
                <Link
                  key={entry}
                  href={catalogHref(params, entry)}
                  aria-current={entry === page ? 'page' : undefined}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                    entry === page
                      ? 'border-hotwheels-red bg-hotwheels-red text-white'
                      : 'border-white/10 text-gray-300 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {entry}
                </Link>
              )
            )}
            {page < initial.totalPages && (
              <Link
                href={catalogHref(params, page + 1)}
                className="rounded-md border border-white/10 px-3 py-2 text-sm text-gray-300 hover:border-white/30 hover:text-white transition-colors"
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
