import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag } from '@/lib/queries'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.heroMedia.delete({ where: { id: params.id } })

  // compact sortOrder so gaps don't accumulate
  const remaining = await prisma.heroMedia.findMany({ orderBy: { sortOrder: 'asc' } })
  if (remaining.some((m, i) => m.sortOrder !== i)) {
    await prisma.$transaction(
      remaining.map((m, i) => prisma.heroMedia.update({ where: { id: m.id }, data: { sortOrder: i } }))
    )
  }

  revalidateTag('hero-media')
  return NextResponse.json({ ok: true })
}
