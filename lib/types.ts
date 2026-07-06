import type { Product, Category, ProductImage, SiteSetting, Brand } from '@prisma/client'

export type ProductWithRelations = Product & {
  brand: Brand | null
  categories: Array<{
    category: Category
  }>
  images: Array<{
    imageUrl: string
    altText: string | null
  }>
}

export type SiteSettings = Pick<
  SiteSetting,
  'id' | 'businessName' | 'whatsappNumber' | 'whatsappDefaultMessage' | 'heroTitle' | 'heroSubtitle'
>

export type ProductWithOneImage = Product & {
  brand: Brand | null
  categories: Array<{
    category: Category
  }>
  images: Array<{
    imageUrl: string
    altText: string | null
  }>
}

export const ProductStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  SOLD_OUT: 'SOLD_OUT',
} as const

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus]
