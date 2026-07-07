import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { orderedIds } = await req.json() as { orderedIds: string[] }

  // ponytail: batch update sortOrder by index position
  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.product.update({ where: { id }, data: { sortOrder: i } })
    )
  )

  return NextResponse.json({ ok: true })
}

// one-time reindex: assign sequential sortOrder to all products
export async function PATCH() {
  const products = await prisma.product.findMany({ select: { id: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] })
  await prisma.$transaction(
    products.map((p, i) => prisma.product.update({ where: { id: p.id }, data: { sortOrder: i } }))
  )
  return NextResponse.json({ reindexed: products.length })
}
