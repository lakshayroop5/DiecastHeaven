import { getCategories, getBrands, getCatalogProducts } from '@/lib/queries'
import ProductGrid from '@/components/public/product-grid'
import CatalogFilters from '@/components/public/catalog-filters'
import CatalogEventTracker from '@/components/analytics/catalog-event-tracker'

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string
    brand?: string
    search?: string
    view?: string
    orderType?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const { category, brand, search, view, orderType } = params

  const [categories, brands, initial] = await Promise.all([
    getCategories(),
    getBrands(),
    getCatalogProducts({ search, categorySlug: category, brandSlug: brand, orderType, page: 1 }),
  ])

  const showBrandView = view === 'brands'

  const activeFilterCount =
    (orderType ? 1 : 0) + (category ? 1 : 0) + (brand ? 1 : 0)

  // Remount the grid when filters change so it resets to a fresh page 1.
  const gridKey = [search, category, brand, orderType, view].filter(Boolean).join('|') || 'all'

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <CatalogEventTracker search={search} category={category} brand={brand} orderType={orderType} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hotwheels-white mb-4">
            {search
              ? `Search: "${search}"`
              : showBrandView
              ? 'Shop by Brand'
              : 'Catalog'}
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
          initialPage={1}
          total={initial.total}
          totalPages={initial.totalPages}
          search={search}
          categorySlug={category}
          brandSlug={brand}
          orderType={orderType}
        />
      </div>
    </div>
  )
}
