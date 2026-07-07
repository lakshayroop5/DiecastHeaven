import prisma from '@/lib/prisma'
import { toSlug } from '@/lib/slug'
import DeleteButton from '../delete-button'
import AddForm from '../add-form'

export const dynamic = 'force-dynamic'

export default function AdminBrands() {
  const addBrand = async (name: string) => {
    'use server'
    await prisma.brand.create({ data: { name, slug: toSlug(name) } })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Brands</h1>
      <div className="mb-6 max-w-md">
        <AddForm placeholder="New brand name" onAdd={addBrand} />
      </div>
      <BrandList />
    </div>
  )
}

async function BrandList() {
  const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { products: true } } } })
  return (
    <div className="bg-hotwheels-gray rounded-lg border border-hotwheels-black">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hotwheels-black text-left text-gray-400">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Slug</th>
            <th className="px-4 py-3">Products</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((b) => (
            <tr key={b.id} className="border-b border-hotwheels-black">
              <td className="px-4 py-3 font-medium">{b.name}</td>
              <td className="px-4 py-3 text-gray-400">{b.slug}</td>
              <td className="px-4 py-3 text-gray-400">{b._count.products}</td>
              <td className="px-4 py-3"><DeleteButton endpoint={`/api/admin/brands/${b.id}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
