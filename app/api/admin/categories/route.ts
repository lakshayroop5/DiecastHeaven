import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  return NextResponse.json(await prisma.category.findMany({ orderBy: { name: 'asc' } }))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const created = await prisma.category.create({ data: body })
  return NextResponse.json(created, { status: 201 })
}
