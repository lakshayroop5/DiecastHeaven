import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag } from '@/lib/queries'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { brand: true, categories: { include: { category: true } }, images: true },
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { categoryIds, images, ...product } = body

  const data: any = { ...product }

  // ponytail: only touch relations when explicitly provided (reorder sends none)
  if (categoryIds !== undefined) {
    await prisma.productCategory.deleteMany({ where: { productId: params.id } })
    data.categories = categoryIds.length
      ? { create: categoryIds.map((id: string) => ({ categoryId: id })) }
      : { deleteMany: {} }
  }

  if (images !== undefined) {
    await prisma.productImage.deleteMany({ where: { productId: params.id } })
    data.images = images.length
      ? { create: images }
      : { deleteMany: {} }
  }

  const updated = await prisma.product.update({
    where: { id: params.id },
    data,
    include: { brand: true, categories: { include: { category: true } }, images: true },
  })

  revalidateTag('products')
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.product.delete({ where: { id: params.id } })
  revalidateTag('products')
  return NextResponse.json({ ok: true })
}
