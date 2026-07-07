import { Suspense } from 'react'
import { getCategories, getBrands } from '@/lib/queries'
import ProductGrid from '@/components/public/product-grid'
import CategoryFilter from '@/components/public/category-filter'
import BrandFilter from '@/components/public/brand-filter'

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string
    brand?: string
    search?: string
    view?: string
  }>
}

export const dynamic = 'force-dynamic'

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
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
  )
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const { category, brand, search, view } = params

  const [categories, brands] = await Promise.all([getCategories(), getBrands()])

  const showBrandView = view === 'brands'

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hotwheels-white mb-4">
            {search
              ? `Search: "${search}"`
              : showBrandView
              ? 'Shop by Brand'
              : 'Catalog'}
          </h1>
          <div className="space-y-4">
            <CategoryFilter categories={categories} />
            {showBrandView ? (
              <BrandFilter brands={brands} layout="grid" />
            ) : (
              <BrandFilter brands={brands} />
            )}
          </div>
          {search && (
            <p className="mt-4 text-sm text-gray-400">
              Searching for &quot;{search}&quot;...
            </p>
          )}
        </div>

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid search={search} categorySlug={category} brandSlug={brand} />
        </Suspense>
      </div>
    </div>
  )
}
