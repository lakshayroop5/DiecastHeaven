import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/queries'

// ponytail: single source of truth = DB. Admin settings page writes here.
export async function GET() {
  const settings = await getSiteSettings()
  return NextResponse.json({
    businessName: settings?.businessName || process.env.DEFAULT_BUSINESS_NAME || '',
    whatsappNumber: settings?.whatsappNumber || process.env.WHATSAPP_NUMBER || '',
    whatsappDefaultMessage: settings?.whatsappDefaultMessage || process.env.WHATSAPP_MESSAGE || '',
  })
}
