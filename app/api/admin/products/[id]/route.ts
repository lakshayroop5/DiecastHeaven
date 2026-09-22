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
  const imageRows = (images ?? []) as Array<{ imageUrl: string; altText: string | null; sortOrder?: number }>

  const data: any = { ...product }

  // ponytail: only touch relations when explicitly provided (reorder sends none)
  // ponytail: deletes independent, run together; writes next wave
  await Promise.all([
    categoryIds !== undefined
      ? prisma.productCategory.deleteMany({ where: { productId: params.id } })
      : null,
    images !== undefined
      ? prisma.productImage.deleteMany({ where: { productId: params.id } })
      : null,
  ])

  if (categoryIds !== undefined) {
    data.categories = categoryIds.length
      ? { create: categoryIds.map((id: string) => ({ categoryId: id })) }
      : { deleteMany: {} }
  }

  const [updated] = await Promise.all([
    prisma.product.update({
      where: { id: params.id },
      data,
      include: { brand: true, categories: { include: { category: true } }, images: true },
    }),
    // ponytail: one INSERT for all images, not N nested writes
    imageRows.length
      ? prisma.productImage.createMany({
          data: imageRows.map((img, i) => ({
            productId: params.id,
            imageUrl: img.imageUrl,
            altText: img.altText ?? null,
            sortOrder: img.sortOrder ?? i,
          })),
        })
      : null,
  ])

  // ponytail: createMany ran beside update, so refresh the included rows it raced
  if (images !== undefined && imageRows.length) {
    updated.images = await prisma.productImage.findMany({
      where: { productId: params.id },
      orderBy: { sortOrder: 'asc' },
    })
  }

  revalidateTag('products')
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.product.delete({ where: { id: params.id } })
  revalidateTag('products')
  return NextResponse.json({ ok: true })
}
