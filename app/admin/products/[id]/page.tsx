import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductForm from '../product-form'

export const metadata = { title: 'Edit Product — Admin' }

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { categories: true, images: true },
  })
  if (!product) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={product as any} />
    </div>
  )
}
