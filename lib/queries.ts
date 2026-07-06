import prisma from './prisma'
import type { ProductWithRelations } from './types'

// ponytail: catch DB errors at build time (libsql migration check returns 400 on Turso during prerender)
async function safeQuery<T>(query: Promise<T>, fallback: T): Promise<T> {
  try {
    return await query
  } catch (error: any) {
    console.error('DB query error:', JSON.stringify({
      code: error?.code,
      message: error?.message,
      meta: error?.meta,
      clientVersion: error?.clientVersion,
    }))
    return fallback
  }
}

const DEFAULT_INCLUDE = {
  brand: true,
  categories: { include: { category: true } },
  images: true,
}

const SEARCH_INCLUDE = {
  brand: true,
  categories: { include: { category: true } },
  images: { take: 1 },
}

export function getSiteSettings() {
  return safeQuery(prisma.siteSetting.findFirst(), null)
}

export function getCategories() {
  return safeQuery(prisma.category.findMany({ orderBy: { name: 'asc' } }), [])
}

export function getBrands() {
  return safeQuery(prisma.brand.findMany({ orderBy: { name: 'asc' } }), [])
}

export function getFeaturedProducts(limit = 6): Promise<ProductWithRelations[]> {
  return safeQuery(
    prisma.product.findMany({
      where: { status: 'PUBLISHED', featured: true },
      include: DEFAULT_INCLUDE,
      take: limit,
    }) as Promise<ProductWithRelations[]>,
    []
  )
}

export function getPublishedProducts(): Promise<ProductWithRelations[]> {
  return safeQuery(
    prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      include: DEFAULT_INCLUDE,
    }) as Promise<ProductWithRelations[]>,
    []
  )
}

export function getCatalogProducts({
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

  return safeQuery(
    prisma.product.findMany({
      where: { AND: conditions },
      include: DEFAULT_INCLUDE,
    }) as Promise<ProductWithRelations[]>,
    []
  )
}

export function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  return safeQuery(
    prisma.product.findUnique({
      where: { slug },
      include: DEFAULT_INCLUDE,
    }) as Promise<ProductWithRelations | null>,
    null
  )
}

export function getRelatedProducts(
  categoryIds: string[],
  excludeProductId: string,
  limit = 4
): Promise<ProductWithRelations[]> {
  if (categoryIds.length === 0) return Promise.resolve([])
  return safeQuery(
    prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: excludeProductId },
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      include: SEARCH_INCLUDE,
      take: limit,
    }) as Promise<ProductWithRelations[]>,
    []
  )
}

export type { ProductWithRelations } from './types'
