import { getPublishedProducts, getCategories, searchProducts } from '@/lib/queries'
import ProductCard from '@/components/public/product-card'
import CategoryFilter from '@/components/public/category-filter'
import EmptyState from '@/components/public/empty-state'
import { Search } from 'lucide-react'

interface CatalogPageProps {
  searchParams: Promise<{ category?: string; search?: string }>
}

export const revalidate = 3600 // ISR

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const { category, search } = params

  const [allProducts, categories] = await Promise.all([
    search ? searchProducts(search) : getPublishedProducts(),
    getCategories(),
  ])

  // Filter by category if specified
  const products = category && category !== 'all'
    ? allProducts.filter(p => p.category?.slug === category)
    : allProducts

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hotwheels-white mb-4">
            {search ? `Search: "${search}"` : 'Catalog'}
          </h1>
          
          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <CategoryFilter categories={categories} />
            
            {search && (
              <div className="text-sm text-gray-400">
                Found {products.length} product{products.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
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
                ? `No products match "${search}"${category ? ` in the selected category` : ''}. Try a different search.`
                : 'Check back soon for new arrivals!'
            }
            action={
              search
                ? {
                    label: 'Clear Filters',
                    onClick: () => {},
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  )
}