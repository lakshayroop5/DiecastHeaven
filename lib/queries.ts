import prisma from './prisma'
import type { ProductWithRelations, ProductWithOneImage } from './types'

class ProductRepository {
  private static readonly DEFAULT_INCLUDE = {
    brand: true,
    categories: { include: { category: true } },
    images: { orderBy: { sortOrder: 'asc' as const } },
  }

  private static readonly SEARCH_INCLUDE = {
    brand: true,
    categories: { include: { category: true } },
    images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
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

  static async getBrands() {
    return this.handleQuery(
      prisma.brand.findMany({ orderBy: { name: 'asc' } }),
      'Error fetching brands:'
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

  static async getCatalogProducts({
    search,
    categorySlug,
    brandSlug,
  }: {
    search?: string
    categorySlug?: string
    brandSlug?: string
  }): Promise<ProductWithRelations[]> {
    const conditions: any[] = [{ status: 'PUBLISHED' }]

    if (search) {
      conditions.push({
        OR: [
          { title: { contains: search } },
          { shortDesc: { contains: search } },
          { brand: { name: { contains: search } } },
          { categories: { some: { category: { name: { contains: search } } } } },
        ],
      })
    }

    if (categorySlug) {
      conditions.push({
        categories: { some: { category: { slug: categorySlug } } },
      })
    }

    if (brandSlug) {
      conditions.push({
        brand: { slug: brandSlug },
      })
    }

    return this.handleQuery(
      prisma.product.findMany({
        where: { AND: conditions },
        include: this.DEFAULT_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }) as Promise<ProductWithRelations[]>,
      'Error fetching catalog products:'
    )
  }

  static async getPublishedProductsByCategory(categoryId: string): Promise<ProductWithRelations[]> {
    return this.handleQuery(
      prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          categories: { some: { categoryId } },
        },
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
            { shortDesc: { contains: query } },
            { brand: { name: { contains: query } } },
            { categories: { some: { category: { name: { contains: query } } } } },
          ],
        },
        include: this.SEARCH_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }) as Promise<ProductWithRelations[]>,
      'Error searching products:'
    )
  }

  static async getRelatedProducts(
    categoryIds: string[],
    excludeProductId: string,
    limit = 4
  ): Promise<ProductWithOneImage[]> {
    if (categoryIds.length === 0) return []
    return this.handleQuery(
      prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          id: { not: excludeProductId },
          categories: { some: { categoryId: { in: categoryIds } } },
        },
        include: this.SEARCH_INCLUDE,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }) as Promise<ProductWithOneImage[]>,
      'Error fetching related products:'
    )
  }
}

export const getSiteSettings = () => ProductRepository.getSiteSettings()
export const getCategories = () => ProductRepository.getCategories()
export const getBrands = () => ProductRepository.getBrands()
export const getFeaturedProducts = (limit?: number) =>
  ProductRepository.getFeaturedProducts(limit)
export const getPublishedProducts = () => ProductRepository.getPublishedProducts()
export const getCatalogProducts = (params: {
  search?: string
  categorySlug?: string
  brandSlug?: string
}) => ProductRepository.getCatalogProducts(params)
export const getPublishedProductsByCategory = (categoryId: string) =>
  ProductRepository.getPublishedProductsByCategory(categoryId)
export const getProductBySlug = (slug: string) =>
  ProductRepository.getProductBySlug(slug)
export const searchProducts = (query: string) =>
  ProductRepository.searchProducts(query)
export const getRelatedProducts = (categoryIds: string[], excludeProductId: string, limit?: number) =>
  ProductRepository.getRelatedProducts(categoryIds, excludeProductId, limit)

export type { ProductWithRelations, ProductWithOneImage } from './types'
