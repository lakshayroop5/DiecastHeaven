'use client'

import { MessageCircle } from 'lucide-react'
import { buildProductInquiryLink, buildGeneralInquiryLink } from '@/lib/whatsapp'

interface WhatsAppCTAProps {
  productName?: string
  variant?: 'primary' | 'secondary' | 'small'
}

// Default settings as fallback
const defaultSettings = {
  businessName: 'Hot Wheels Collector',
  whatsappNumber: '919876543210',
  whatsappDefaultMessage: 'Hi, I am interested in {product}. Please share more details.',
}

export default function WhatsAppCTA({ 
  productName, 
  variant = 'primary' 
}: WhatsAppCTAProps) {
  // In a real app, you'd fetch settings from the server
  // For now, we'll use a client component that accepts settings as props or uses defaults
  
  const handleClick = async () => {
    // Fetch settings from API route
    try {
      const response = await fetch('/api/settings')
      const settings = response.ok ? await response.json() : defaultSettings
      
      const link = productName 
        ? buildProductInquiryLink(settings, productName)
        : buildGeneralInquiryLink(settings)
      
      window.open(link, '_blank')
    } catch (error) {
      // Fallback to default
      const link = productName 
        ? buildProductInquiryLink(defaultSettings, productName)
        : buildGeneralInquiryLink(defaultSettings)
      window.open(link, '_blank')
    }
  }

  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors"
  
  const variantClasses = {
    primary: "bg-hotwheels-red text-white px-6 py-3 hover:bg-red-700",
    secondary: "bg-hotwheels-gray text-hotwheels-white px-6 py-3 hover:bg-hotwheels-black border border-hotwheels-red",
    small: "bg-hotwheels-red text-white px-3 py-1.5 text-sm hover:bg-red-700",
  }

  const buttonText = productName ? 'Inquire on WhatsApp' : 'Contact via WhatsApp'

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      <MessageCircle className="h-5 w-5" />
      {buttonText}
    </button>
  )
}