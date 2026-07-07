import type { SiteSetting } from '@prisma/client'

type SiteSettings = Pick<
  SiteSetting,
  'id' | 'businessName' | 'whatsappNumber' | 'whatsappDefaultMessage' | 'heroTitle' | 'heroSubtitle'
>

const WHATSAPP_BASE_URL = 'https://wa.me'

/**
 * Formats a phone number for WhatsApp URL
 * Handles Indian and international number formats
 */
function formatPhoneForWhatsApp(phoneNumber: string): string {
  // Remove all non-digits
  const digits = phoneNumber.replace(/\D/g, '')
  
  // Add India country code if 10-digit number without country code
  if (digits.length === 10 && !digits.startsWith('91')) {
    return '91' + digits
  }
  
  return digits
}

/**
 * Builds a WhatsApp click-to-chat URL
 */
export function buildWhatsAppLink(
  phoneNumber: string,
  message?: string
): string {
  const formattedPhone = formatPhoneForWhatsApp(phoneNumber)
  const base = `${WHATSAPP_BASE_URL}/${formattedPhone}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/**
 * Builds a general inquiry link for business
 */
export function buildGeneralInquiryLink(settings: SiteSettings): string {
  if (!settings.whatsappNumber) {
    return '#'
  }
  
  const message = settings.whatsappDefaultMessage ?? 'Hi, I am interested in your products.'
  return buildWhatsAppLink(settings.whatsappNumber, message)
}

/**
 * Builds a product-specific inquiry link
 */
export function buildProductInquiryLink(
  settings: SiteSettings,
  productName: string
): string {
  if (!settings.whatsappNumber) {
    return '#'
  }
  
  const template = settings.whatsappDefaultMessage ?? 'I am interested in {product}. Please share more details.'
  const message = template.replace('{product}', productName)
  
  return buildWhatsAppLink(settings.whatsappNumber, message)
}

