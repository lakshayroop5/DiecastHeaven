import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      categories: { include: { category: true } },
      images: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { categoryIds, images, ...product } = body

  // ponytail: assign unique sortOrder so drag-and-drop works reliably
  // ponytail: negative sortOrder = top of list, O(1) insert
  const rows = await prisma.$queryRaw<{ min: number | bigint }[]>`SELECT COALESCE(MIN(sort_order), 0) as min FROM products`
  const nextSortOrder = Number(rows[0]?.min ?? 0) - 1

  const created = await prisma.product.create({
    data: {
      ...product,
      sortOrder: nextSortOrder,
      categories: categoryIds?.length
        ? { create: categoryIds.map((id: string) => ({ categoryId: id })) }
        : undefined,
      images: images?.length
        ? { create: images }
        : undefined,
    },
    include: { brand: true, categories: { include: { category: true } }, images: true },
  })

  return NextResponse.json(created, { status: 201 })
}
