'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function PillFilter({ items, param, layout = 'row' }: {
  items: { id: string; name: string; slug: string }[]
  param: string
  layout?: 'row' | 'grid'
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selected = searchParams.get(param) || 'all'

  const handleChange = (slug: string) => {
    const params = new URLSearchParams(searchParams)
    if (slug === 'all') params.delete(param)
    else params.set(param, slug)
    router.push(`/catalog?${params.toString()}`)
  }

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[{ id: 'all', name: 'All Brands', slug: 'all' }, ...items].map((item) => (
          <button key={item.id} onClick={() => handleChange(item.slug)}
            className={`rounded-lg p-4 text-center transition-colors border ${
              selected === item.slug
                ? 'bg-hotwheels-red text-white border-hotwheels-red'
                : 'bg-hotwheels-gray text-gray-300 border-hotwheels-gray hover:border-hotwheels-red'
            }`}>
            {item.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => handleChange('all')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selected === 'all'
            ? param === 'brand' ? 'bg-hotwheels-yellow text-hotwheels-black' : 'bg-hotwheels-red text-white'
            : 'bg-hotwheels-gray text-gray-300 hover:bg-hotwheels-black hover:text-hotwheels-white'
        }`}>
        {param === 'brand' ? 'All Brands' : 'All'}
      </button>
      {items.map((item) => (
        <button key={item.id} onClick={() => handleChange(item.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selected === item.slug
              ? param === 'brand' ? 'bg-hotwheels-yellow text-hotwheels-black' : 'bg-hotwheels-red text-white'
              : 'bg-hotwheels-gray text-gray-300 hover:bg-hotwheels-black hover:text-hotwheels-white'
          }`}>
          {item.name}
        </button>
      ))}
    </div>
  )
}
