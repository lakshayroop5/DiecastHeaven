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

  // ponytail: shift all existing products down by 1, new product gets sortOrder 0 (top)
  await prisma.$executeRaw`UPDATE products SET sort_order = sort_order + 1`

  const created = await prisma.product.create({
    data: {
      ...product,
      sortOrder: 0,
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
