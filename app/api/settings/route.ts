import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/queries'

export async function GET() {
  const settings = await getSiteSettings()
  
  if (!settings) {
    return NextResponse.json({
      businessName: 'Diecast Heaven',
      whatsappNumber: '919876543210',
      whatsappDefaultMessage: 'Hi, I am interested in {product}. Please share more details.',
    })
  }
  
  return NextResponse.json(settings)
}