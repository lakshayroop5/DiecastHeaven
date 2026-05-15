export interface SiteSetting {
   id?: string
   businessName: string
   whatsappNumber: string
   whatsappDefaultMessage: string
   heroTitle?: string | null
   heroSubtitle?: string | null
}

/**
 * Builds a WhatsApp click-to-chat URL
 * Uses the official wa.me format with full international number
 * https://wa.me/<number> with optional text parameter
 */
export function buildWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  // Clean the phone number - remove all non-digit characters except leading +
  let cleaned = phoneNumber.replace(/\D/g, '')
  
  // Ensure it starts with country code (default to 1 if no country code and number starts with 1)
  // For India, numbers typically start with 9, 8, 7, 6
  // For US, numbers start with 1 + area code
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    // Assume India if 10 digits and doesn't start with 91
    cleaned = '91' + cleaned
  }
  
  // URL encode the message
  const encodedMessage = encodeURIComponent(message)
  
  return `https://wa.me/${cleaned}?text=${encodedMessage}`
}

/**
 * Builds a general inquiry link for business
 */
export function buildGeneralInquiryLink(
  settings: SiteSetting
): string {
  if (!settings.whatsappNumber || !settings.whatsappDefaultMessage) {
    return '#'
  }
  
  return buildWhatsAppLink(
    settings.whatsappNumber,
    settings.whatsappDefaultMessage
  )
}

/**
 * Builds a product-specific inquiry link
 */
export function buildProductInquiryLink(
  settings: SiteSetting,
  productName: string
): string {
  if (!settings.whatsappNumber || !settings.whatsappDefaultMessage) {
    return '#'
  }
  
  // Replace {product} placeholder with actual product name
  const message = settings.whatsappDefaultMessage.replace(
    '{product}',
    productName
  )
  
  return buildWhatsAppLink(settings.whatsappNumber, message)
}

/**
 * Formats phone number for display
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Clean the number
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  // Format as Indian number (XX XXXX XXX XXX)
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    const number = cleaned.substring(2)
    return `+91 ${number.substring(0, 5)} ${number.substring(5)}`
  }
  
  if (cleaned.length === 10) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`
  }
  
  return phoneNumber
}