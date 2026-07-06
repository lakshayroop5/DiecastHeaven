import Link from 'next/link'
import prisma from '@/lib/prisma'
import SortableProducts from './sortable-products'

export const dynamic = 'force-dynamic'

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    include: { brand: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="px-4 py-2 bg-hotwheels-red text-white rounded text-sm font-semibold hover:bg-red-700">
          + New Product
        </Link>
      </div>
      <SortableProducts products={JSON.parse(JSON.stringify(products))} />
    </div>
  )
}
