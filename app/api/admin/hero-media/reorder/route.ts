import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag } from '@/lib/queries'

export async function POST(req: NextRequest) {
  const { orderedIds } = await req.json() as { orderedIds: string[] }

  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.heroMedia.update({ where: { id }, data: { sortOrder: i } })
    )
  )

  revalidateTag('hero-media')
  return NextResponse.json({ ok: true })
}
