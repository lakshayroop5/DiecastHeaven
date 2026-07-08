import prisma from '@/lib/prisma'
import { getCategories, getBrands } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [productCount, categories, brands] = await Promise.all([
    prisma.product.count(),
    getCategories(),
    getBrands(),
  ])

  const stats = [
    { label: 'Products', value: productCount, href: '/admin/products' },
    { label: 'Categories', value: categories.length, href: '/admin/categories' },
    { label: 'Brands', value: brands.length, href: '/admin/brands' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <a
            key={s.label}
            href={s.href}
            className="bg-hotwheels-gray rounded-lg p-6 border border-hotwheels-black hover:border-hotwheels-red/50 transition-colors"
          >
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className="text-3xl font-bold text-hotwheels-yellow mt-1">{s.value}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
