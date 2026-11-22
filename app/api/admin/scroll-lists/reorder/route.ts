import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag } from '@/lib/queries'

export async function POST(req: NextRequest) {
  const { orderedIds } = (await req.json()) as { orderedIds?: unknown }
  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: 'orderedIds required' }, { status: 400 })
  }

  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.productScrollList.update({ where: { id: String(id) }, data: { sortOrder: i } })
    )
  )

  revalidateTag('scroll-lists')
  return NextResponse.json({ ok: true })
}
