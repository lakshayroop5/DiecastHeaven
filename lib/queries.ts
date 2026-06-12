import prisma from './prisma'
import type { ProductWithRelations } from './types'

// Repository class implementing repository pattern for data access
class ProductRepository {
  static readonly DEFAULT_INCLUDE = {
    category: true,
    images: { orderBy: { sortOrder: 'asc' as const } },
  }

  private static handleQuery<T>(query: Promise<T>, errorMessage: string): Promise<T> {
    return query.catch((error) => {
      console.error(errorMessage, error)
      throw error
    })
  }

  static async getSiteSettings() {
    return this.handleQuery(
      prisma.siteSetting.findFirst(),
      'Error fetching site settings:'
    )
  }

  static async getCategories() {
    return this.handleQuery(
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      'Error fetching categories:'
    )
  }

  static async getFeaturedProducts(limit = 6): Promise<ProductWithRelations[]> {
    return this.handleQuery(
      prisma.product.findMany({
        where: { status: 'PUBLISHED', featured: true },
        include: this.DEFAULT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }) as Promise<ProductWithRelations[]>,
      'Error fetching featured products:'
    )
  }

  static async getPublishedProducts(): Promise<ProductWithRelations[]> {
    return this.handleQuery(
      prisma.product.findMany({
        where: { status: 'PUBLISHED' },
        include: this.DEFAULT_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }) as Promise<ProductWithRelations[]>,
      'Error fetching published products:'
    )
  }

  static async getPublishedProductsByCategory(categoryId: string): Promise<ProductWithRelations[]> {
    return this.handleQuery(
      prisma.product.findMany({
        where: { status: 'PUBLISHED', categoryId },
        include: this.DEFAULT_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }) as Promise<ProductWithRelations[]>,
      'Error fetching products by category:'
    )
  }

  static async getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
    return this.handleQuery(
      prisma.product.findUnique({
        where: { slug },
        include: this.DEFAULT_INCLUDE,
      }) as Promise<ProductWithRelations | null>,
      'Error fetching product by slug:'
    )
  }

  static async searchProducts(query: string): Promise<ProductWithRelations[]> {
    return this.handleQuery(
      prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { shortDesc: { contains: query } },
          ],
        },
        include: {
          ...this.DEFAULT_INCLUDE,
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      }) as Promise<ProductWithRelations[]>,
      'Error searching products:'
    )
  }

  static async getRelatedProducts(
    categoryId: string,
    excludeProductId: string,
    limit = 4
  ): Promise<ProductWithRelations[]> {
    return this.handleQuery(
      prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          categoryId,
          id: { not: excludeProductId },
        },
        include: {
          ...this.DEFAULT_INCLUDE,
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }) as Promise<ProductWithRelations[]>,
      'Error fetching related products:'
    )
  }
}

// Export individual functions for backward compatibility
export const getSiteSettings = () => ProductRepository.getSiteSettings()
export const getCategories = () => ProductRepository.getCategories()
export const getFeaturedProducts = (limit?: number) => 
  ProductRepository.getFeaturedProducts(limit)
export const getPublishedProducts = () => ProductRepository.getPublishedProducts()
export const getPublishedProductsByCategory = (categoryId: string) => 
  ProductRepository.getPublishedProductsByCategory(categoryId)
export const getProductBySlug = (slug: string) => ProductRepository.getProductBySlug(slug)
export const searchProducts = (query: string) => ProductRepository.searchProducts(query)
export const getRelatedProducts = (categoryId: string, excludeProductId: string, limit?: number) => 
  ProductRepository.getRelatedProducts(categoryId, excludeProductId, limit)

export type { ProductWithRelations } from './types'