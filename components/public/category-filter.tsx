'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryFilterProps {
  categories: Category[]
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category') || 'all'

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category === 'all') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    router.push(`/catalog?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleCategoryChange('all')}
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium transition-colors',
          selectedCategory === 'all'
            ? 'bg-hotwheels-red text-white'
            : 'bg-hotwheels-gray text-gray-300 hover:bg-hotwheels-black hover:text-hotwheels-white'
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryChange(category.slug)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-colors',
            selectedCategory === category.slug
              ? 'bg-hotwheels-red text-white'
              : 'bg-hotwheels-gray text-gray-300 hover:bg-hotwheels-black hover:text-hotwheels-white'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}