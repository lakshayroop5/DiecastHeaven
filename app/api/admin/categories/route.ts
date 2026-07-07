import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag } from '@/lib/queries'

export async function GET() {
  return NextResponse.json(await prisma.category.findMany({ orderBy: { name: 'asc' } }))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const created = await prisma.category.create({ data: body })
  revalidateTag('categories')
  revalidateTag('products')
  return NextResponse.json(created, { status: 201 })
}
