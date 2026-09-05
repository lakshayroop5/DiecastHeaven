import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag } from '@/lib/queries'

export async function GET() {
  const media = await prisma.heroMedia.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json(media)
}

export async function POST(req: NextRequest) {
  const { url, type } = await req.json() as { url?: string; type?: string }
  if (!url) return NextResponse.json({ error: 'No url' }, { status: 400 })

  const count = await prisma.heroMedia.count()
  const media = await prisma.heroMedia.create({
    data: { url, type: type === 'VIDEO' ? 'VIDEO' : 'IMAGE', sortOrder: count },
  })

  revalidateTag('hero-media')
  return NextResponse.json(media)
}
