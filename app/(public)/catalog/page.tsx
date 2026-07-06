import {
  getCatalogProducts,
  getCategories,
  getBrands,
} from '@/lib/queries'
import ProductCard from '@/components/public/product-card'
import CategoryFilter from '@/components/public/category-filter'
import BrandFilter from '@/components/public/brand-filter'
import EmptyState from '@/components/public/empty-state'

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string
    brand?: string
    search?: string
    view?: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const { category, brand, search, view } = params

  const [products, categories, brands] = await Promise.all([
    getCatalogProducts({
      search,
      categorySlug: category,
      brandSlug: brand,
    }),
    getCategories(),
    getBrands(),
  ])

  const showBrandView = view === 'brands'

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hotwheels-white mb-4">
            {search
              ? `Search: "${search}"`
              : showBrandView
              ? 'Shop by Brand'
              : 'Catalog'}
          </h1>

          {/* Filters */}
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
              Found {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="search"
            title={search ? 'No products found' : 'No products available'}
            description={
              search
                ? `No products match "${search}"${
                    category ? ' in the selected category' : ''
                  }. Try a different search.`
                : 'Check back soon for new arrivals!'
            }
          />
        )}
      </div>
    </div>
  )
}
