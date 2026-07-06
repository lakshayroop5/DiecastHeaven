'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Brand {
  id: string
  name: string
  slug: string
}

interface BrandFilterProps {
  brands: Brand[]
  layout?: 'row' | 'grid'
}

export default function BrandFilter({ brands, layout = 'row' }: BrandFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedBrand = searchParams.get('brand') || 'all'

  const handleBrandChange = (slug: string) => {
    const params = new URLSearchParams(searchParams)
    if (slug === 'all') {
      params.delete('brand')
    } else {
      params.set('brand', slug)
    }
    router.push(`/catalog?${params.toString()}`)
  }

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <button
          onClick={() => handleBrandChange('all')}
          className={cn(
            'rounded-lg p-4 text-center transition-colors border',
            selectedBrand === 'all'
              ? 'bg-hotwheels-red text-white border-hotwheels-red'
              : 'bg-hotwheels-gray text-gray-300 border-hotwheels-gray hover:border-hotwheels-red'
          )}
        >
          All Brands
        </button>
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() => handleBrandChange(brand.slug)}
            className={cn(
              'rounded-lg p-4 text-center transition-colors border',
              selectedBrand === brand.slug
                ? 'bg-hotwheels-red text-white border-hotwheels-red'
                : 'bg-hotwheels-gray text-gray-300 border-hotwheels-gray hover:border-hotwheels-red'
            )}
          >
            {brand.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleBrandChange('all')}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          selectedBrand === 'all'
            ? 'bg-hotwheels-yellow text-hotwheels-black'
            : 'bg-hotwheels-gray text-gray-300 hover:bg-hotwheels-black hover:text-hotwheels-white'
        )}
      >
        All Brands
      </button>
      {brands.map((brand) => (
        <button
          key={brand.id}
          onClick={() => handleBrandChange(brand.slug)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            selectedBrand === brand.slug
              ? 'bg-hotwheels-yellow text-hotwheels-black'
              : 'bg-hotwheels-gray text-gray-300 hover:bg-hotwheels-black hover:text-hotwheels-white'
          )}
        >
          {brand.name}
        </button>
      ))}
    </div>
  )
}
