import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const settings = await prisma.siteSetting.findFirst()
  return NextResponse.json(settings || {
    businessName: process.env.DEFAULT_BUSINESS_NAME || '',
    whatsappNumber: process.env.WHATSAPP_NUMBER || '',
    whatsappDefaultMessage: process.env.WHATSAPP_MESSAGE || '',
    heroTitle: process.env.DEFAULT_HERO_TITLE || '',
    heroSubtitle: process.env.DEFAULT_HERO_SUBTITLE || '',
  })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const existing = await prisma.siteSetting.findFirst()

  const saved = existing
    ? await prisma.siteSetting.update({ where: { id: existing.id }, data: body })
    : await prisma.siteSetting.create({ data: body })

  return NextResponse.json(saved)
}
