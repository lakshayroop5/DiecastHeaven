import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag } from '@/lib/queries'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const updated = await prisma.brand.update({ where: { id: params.id }, data: body })
  revalidateTag('brands')
  revalidateTag('products')
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.brand.delete({ where: { id: params.id } })
  revalidateTag('brands')
  revalidateTag('products')
  return NextResponse.json({ ok: true })
}
