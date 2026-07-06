import type { Product, Category, SiteSetting, Brand } from '@prisma/client'

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
