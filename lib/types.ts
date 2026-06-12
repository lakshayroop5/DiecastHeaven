// Domain types for the application
import type { Product, Category, ProductImage, SiteSetting } from '@prisma/client'

// Product with required relations for display
export type ProductWithRelations = Product & {
  category: Category | null
  images: Array<{
    imageUrl: string
    altText: string | null
  }>
}

// Site settings for public display
export type SiteSettings = Pick<
  SiteSetting,
  'id' | 'businessName' | 'whatsappNumber' | 'whatsappDefaultMessage' | 'heroTitle' | 'heroSubtitle'
>

// Product status enum for type safety
export const ProductStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  SOLD_OUT: 'SOLD_OUT',
} as const

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus]