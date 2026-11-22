import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag } from '@/lib/queries'

/** Rename a list. Product associations are by id, so they survive untouched. */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { title } = (await req.json()) as { title?: unknown }
  const name = typeof title === 'string' ? title.trim() : ''
  if (!name) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const updated = await prisma.productScrollList.update({
    where: { id: params.id },
    data: { title: name },
  })

  revalidateTag('scroll-lists')
  return NextResponse.json(updated)
}

/** Delete a list. `onDelete: Cascade` on the join table removes its rows. */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.productScrollList.delete({ where: { id: params.id } })

  // compact sortOrder so gaps don't accumulate (same as hero media)
  const remaining = await prisma.productScrollList.findMany({ orderBy: { sortOrder: 'asc' } })
  if (remaining.some((list, i) => list.sortOrder !== i)) {
    await prisma.$transaction(
      remaining.map((list, i) =>
        prisma.productScrollList.update({ where: { id: list.id }, data: { sortOrder: i } })
      )
    )
  }

  revalidateTag('scroll-lists')
  return NextResponse.json({ ok: true })
}
