import prisma from './prisma'
import type { Product, Category, ProductImage } from '@prisma/client'

export type ProductWithCategory = Product & {
   category: Category | null
   images: ProductImage[]
}

// Site settings
export async function getSiteSettings() {
  try {
    return await prisma.siteSetting.findFirst()
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
}

// Categories
export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Products
export async function getFeaturedProducts(limit = 6) {
  try {
    return await prisma.product.findMany({
      where: { status: 'PUBLISHED', featured: true },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export async function getPublishedProducts(): Promise<ProductWithCategory[]> {
   try {
     return await prisma.product.findMany({
       where: { status: 'PUBLISHED' },
       include: {
         category: true,
         images: { orderBy: { sortOrder: 'asc' } },
       },
       orderBy: { createdAt: 'desc' },
     }) as ProductWithCategory[]
   } catch (error) {
     console.error('Error fetching published products:', error)
     return []
   }
 }

export async function getPublishedProductsByCategory(categoryId: string) {
  try {
    return await prisma.product.findMany({
      where: { status: 'PUBLISHED', categoryId },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching products by category:', error)
    return []
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    })
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return null
  }
}

export async function searchProducts(query: string): Promise<ProductWithCategory[]> {
   try {
     return await prisma.product.findMany({
       where: {
         status: 'PUBLISHED',
         OR: [
           { title: { contains: query } },
           { description: { contains: query } },
           { shortDesc: { contains: query } },
         ],
       },
       include: {
         category: true,
         images: { orderBy: { sortOrder: 'asc' }, take: 1 },
       },
       orderBy: { createdAt: 'desc' },
     }) as ProductWithCategory[]
   } catch (error) {
     console.error('Error searching products:', error)
     return []
   }
 }

export async function getRelatedProducts(categoryId: string, excludeProductId: string, limit = 4) {
  try {
    return await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        categoryId,
        id: { not: excludeProductId },
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}