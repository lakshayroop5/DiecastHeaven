'use client'

import { MessageCircle } from 'lucide-react'
import { buildProductInquiryLink, buildGeneralInquiryLink } from '@/lib/whatsapp'

interface WhatsAppCTAProps {
  productName?: string
  variant?: 'primary' | 'secondary' | 'small' | 'hero'
}

const DEFAULT_SETTINGS = {
  id: '',
  businessName: process.env.DEFAULT_BUSINESS_NAME || '',
  whatsappNumber: process.env.WHATSAPP_NUMBER || '',
  whatsappDefaultMessage: process.env.WHATSAPP_MESSAGE || '',
  heroTitle: '',
  heroSubtitle: '',
}

const VARIANT_STYLES = {
  primary: 'bg-hotwheels-red text-white px-6 py-3 hover:bg-red-700',
  secondary: 'bg-hotwheels-gray text-hotwheels-white px-6 py-3 hover:bg-hotwheels-black border border-hotwheels-red',
  small: 'bg-hotwheels-red text-white px-3 py-1.5 text-sm hover:bg-red-700',
  hero: 'border border-white/40 text-white px-6 py-3 hover:bg-white/10',
} as const

export default function WhatsAppCTA({ 
  productName, 
  variant = 'primary' 
}: WhatsAppCTAProps) {
  const handleClick = async () => {
    try {
      const response = await fetch('/api/settings')
      const settings = response.ok ? await response.json() : DEFAULT_SETTINGS
      
      const link = productName 
        ? buildProductInquiryLink(settings, productName)
        : buildGeneralInquiryLink(settings)
      
      window.open(link, '_blank')
    } catch {
      const link = productName 
        ? buildProductInquiryLink(DEFAULT_SETTINGS, productName)
        : buildGeneralInquiryLink(DEFAULT_SETTINGS)
      window.open(link, '_blank')
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors ${VARIANT_STYLES[variant]}`}
    >
      <MessageCircle className="h-5 w-5" />
      {productName ? (
        <>
          <span className="sm:hidden">Inquire</span>
          <span className="hidden sm:inline">Inquire on WhatsApp</span>
        </>
      ) : (
        <>
          <span className="sm:hidden">Contact</span>
          <span className="hidden sm:inline">Contact via WhatsApp</span>
        </>
      )}
    </button>
  )
}