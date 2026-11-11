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
    // Drop any stale pagination cursor when filters change (we use scroll-load now).
    params.delete('page')
    if (slug === 'all') params.delete(param)
    else params.set(param, slug)
    router.push(`/catalog?${params.toString()}`)
  }

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {[{ id: 'all', name: 'All Brands', slug: 'all' }, ...items].map((item) => (
          <button key={item.id} onClick={() => handleChange(item.slug)}
            className={`rounded-sm px-3 py-2.5 text-center text-xs font-black uppercase tracking-widest font-mono transition-all border-b-2 ${
              selected === item.slug
                ? 'bg-hotwheels-red text-white border-hotwheels-yellow shadow-[0_4px_16px_rgba(230,0,0,0.4)]'
                : 'bg-[#141414] text-gray-300 border-transparent border border-[#2D2D2D] hover:border-hotwheels-red/60 hover:text-white'
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
        className={`px-4 py-2 rounded-sm text-xs font-black uppercase tracking-widest font-mono transition-all border-b-2 ${
          selected === 'all'
            ? param === 'brand' ? 'bg-hotwheels-yellow text-hotwheels-black border-hotwheels-red' : 'bg-hotwheels-red text-white border-hotwheels-yellow shadow-[0_4px_16px_rgba(230,0,0,0.4)]'
            : 'bg-[#141414] text-gray-300 border-transparent border border-[#2D2D2D] hover:border-hotwheels-red/60 hover:text-white'
        }`}>
        {param === 'brand' ? 'All Brands' : 'All'}
      </button>
      {items.map((item) => (
        <button key={item.id} onClick={() => handleChange(item.slug)}
          className={`px-4 py-2 rounded-sm text-xs font-black uppercase tracking-widest font-mono transition-all border-b-2 ${
            selected === item.slug
              ? param === 'brand' ? 'bg-hotwheels-yellow text-hotwheels-black border-hotwheels-red' : 'bg-hotwheels-red text-white border-hotwheels-yellow shadow-[0_4px_16px_rgba(230,0,0,0.4)]'
              : 'bg-[#141414] text-gray-300 border-transparent border border-[#2D2D2D] hover:border-hotwheels-red/60 hover:text-white'
          }`}>
          {item.name}
        </button>
      ))}
    </div>
  )
}
