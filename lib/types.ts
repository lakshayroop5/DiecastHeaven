import type { Product, Category, Brand } from '@prisma/client'

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
