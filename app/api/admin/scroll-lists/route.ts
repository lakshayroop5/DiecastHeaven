import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag } from '@/lib/queries'

export async function GET() {
  const lists = await prisma.productScrollList.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { _count: { select: { products: true } } },
  })
  return NextResponse.json(
    lists.map(({ _count, ...list }) => ({ ...list, productCount: _count.products }))
  )
}

export async function POST(req: NextRequest) {
  const { title } = (await req.json()) as { title?: unknown }
  const name = typeof title === 'string' ? title.trim() : ''
  if (!name) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const count = await prisma.productScrollList.count()
  const list = await prisma.productScrollList.create({
    data: { title: name, sortOrder: count },
  })

  revalidateTag('scroll-lists')
  return NextResponse.json({ ...list, productCount: 0 }, { status: 201 })
}
