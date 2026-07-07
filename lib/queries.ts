import prisma from './prisma'
import type { ProductWithRelations } from './types'
import { unstable_cache, revalidateTag as nextRevalidateTag } from 'next/cache'
import { cache } from 'react'

// Memory cache for items exceeding Next.js's 2MB Data Cache limit (e.g. products with large base64 image data)
const largeItemMemoryCache = new Map<string, { result: any; tags: string[]; timestamp: number }>()

export function revalidateMemoryTag(tag: string) {
  largeItemMemoryCache.forEach((value, key) => {
    if (value.tags.includes(tag)) {
      largeItemMemoryCache.delete(key)
    }
  })
}

// Unified revalidation helper for both Next.js Data Cache and local memory cache
export function revalidateTag(tag: string) {
  nextRevalidateTag(tag)
  revalidateMemoryTag(tag)
}

// Custom wrapper to transparently bypass Next.js 2MB limit
export function safeUnstableCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  options: { tags: string[] }
): (...args: Parameters<T>) => ReturnType<T> {
  const cachedFn = unstable_cache(
    async (...args: any[]) => {
      const result = await fn(...args)
      if (result) {
        // Estimate object size in bytes (using UTF-16 character sizing)
        const jsonStr = JSON.stringify(result)
        const size = jsonStr.length * 2
        
        // Next.js limit is 2MB. We use 1.5MB as a safe threshold.
        if (size > 1.5 * 1024 * 1024) {
          const cacheKey = [...keyParts, ...args.map((a) => String(a))].join(':')
          largeItemMemoryCache.set(cacheKey, {
            result,
            tags: options.tags,
            timestamp: Date.now(),
          })
          return { __is_large_item: true, cacheKey }
        }
      }
      return result
    },
    keyParts,
    options
  )

  return (async (...args: any[]) => {
    const val = await cachedFn(...args)
    if (val && typeof val === 'object' && '__is_large_item' in val) {
      const cacheKey = (val as any).cacheKey
      if (largeItemMemoryCache.has(cacheKey)) {
        return largeItemMemoryCache.get(cacheKey)!.result
      }
      // If server restarted or entry evicted, fetch a fresh copy
      return fn(...args)
    }
    return val
  }) as any
}

async function safeQuery<T>(query: Promise<T>, fallback: T): Promise<T> {
  try {
    return await query
  } catch (error: any) {
    console.error('DB query error:', error?.code || error?.message || error)
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

// 1. Site Settings
const getSiteSettingsRaw = () => {
  return safeQuery(prisma.siteSetting.findFirst(), null)
}
export const getSiteSettings = cache(
  safeUnstableCache(
    getSiteSettingsRaw,
    ['site-settings'],
    { tags: ['settings'] }
  )
)

// 2. Categories
const getCategoriesRaw = () => {
  return safeQuery(prisma.category.findMany({ orderBy: { name: 'asc' } }), [])
}
export const getCategories = cache(
  safeUnstableCache(
    getCategoriesRaw,
    ['categories'],
    { tags: ['categories'] }
  )
)

// 3. Brands
const getBrandsRaw = () => {
  return safeQuery(prisma.brand.findMany({ orderBy: { name: 'asc' } }), [])
}
export const getBrands = cache(
  safeUnstableCache(
    getBrandsRaw,
    ['brands'],
    { tags: ['brands'] }
  )
)

// 4. Featured Products
const getFeaturedProductsRaw = (limit = 6): Promise<ProductWithRelations[]> => {
  return safeQuery(
    prisma.product.findMany({
      where: { status: { in: ['PUBLISHED', 'SOLD_OUT'] }, featured: true },
      include: DEFAULT_INCLUDE,
      take: limit,
      orderBy: { sortOrder: 'asc' },
    }) as Promise<ProductWithRelations[]>,
    []
  )
}
export const getFeaturedProducts = (limit = 6) => {
  const getCached = cache(
    safeUnstableCache(
      async (l: number) => getFeaturedProductsRaw(l),
      ['featured-products'],
      { tags: ['products', 'featured-products'] }
    )
  )
  return getCached(limit)
}

// 5. Published Products
const getPublishedProductsRaw = (): Promise<ProductWithRelations[]> => {
  return safeQuery(
    prisma.product.findMany({
      where: { status: { in: ['PUBLISHED', 'SOLD_OUT'] } },
      include: DEFAULT_INCLUDE,
      orderBy: { sortOrder: 'asc' },
    }) as Promise<ProductWithRelations[]>,
    []
  )
}
export const getPublishedProducts = cache(
  safeUnstableCache(
    getPublishedProductsRaw,
    ['published-products'],
    { tags: ['products', 'published-products'] }
  )
)

// 6. Catalog Products
const getCatalogProductsRaw = ({
  search,
  categorySlug,
  brandSlug,
}: {
  search?: string
  categorySlug?: string
  brandSlug?: string
}): Promise<ProductWithRelations[]> => {
  const conditions: any[] = [{ status: { in: ['PUBLISHED', 'SOLD_OUT'] } }]

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
      orderBy: { sortOrder: 'asc' },
    }) as Promise<ProductWithRelations[]>,
    []
  )
}
export const getCatalogProducts = (args: {
  search?: string
  categorySlug?: string
  brandSlug?: string
}) => {
  const getCached = cache(
    safeUnstableCache(
      async (s?: string, c?: string, b?: string) =>
        getCatalogProductsRaw({ search: s, categorySlug: c, brandSlug: b }),
      ['catalog-products'],
      { tags: ['products', 'catalog-products'] }
    )
  )
  return getCached(args.search, args.categorySlug, args.brandSlug)
}

// 7. Catalog Product Slugs
const getCatalogProductSlugsRaw = ({
  search,
  categorySlug,
  brandSlug,
}: {
  search?: string
  categorySlug?: string
  brandSlug?: string
}): Promise<{ slug: string }[]> => {
  const conditions: any[] = [{ status: { in: ['PUBLISHED', 'SOLD_OUT'] } }]

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
      select: { slug: true },
      orderBy: { sortOrder: 'asc' },
    }),
    []
  )
}
export const getCatalogProductSlugs = (args: {
  search?: string
  categorySlug?: string
  brandSlug?: string
}) => {
  const getCached = cache(
    safeUnstableCache(
      async (s?: string, c?: string, b?: string) =>
        getCatalogProductSlugsRaw({ search: s, categorySlug: c, brandSlug: b }),
      ['catalog-product-slugs'],
      { tags: ['products', 'catalog-product-slugs'] }
    )
  )
  return getCached(args.search, args.categorySlug, args.brandSlug)
}

// 8. Featured Product Slugs
const getFeaturedProductSlugsRaw = (limit = 6): Promise<{ slug: string }[]> => {
  return safeQuery(
    prisma.product.findMany({
      where: { status: { in: ['PUBLISHED', 'SOLD_OUT'] }, featured: true },
      select: { slug: true },
      take: limit,
      orderBy: { sortOrder: 'asc' },
    }),
    []
  )
}
export const getFeaturedProductSlugs = (limit = 6) => {
  const getCached = cache(
    safeUnstableCache(
      async (l: number) => getFeaturedProductSlugsRaw(l),
      ['featured-product-slugs'],
      { tags: ['products', 'featured-product-slugs'] }
    )
  )
  return getCached(limit)
}

// 9. Product By Slug
const getProductBySlugRaw = (slug: string): Promise<ProductWithRelations | null> => {
  return safeQuery(
    prisma.product.findUnique({
      where: { slug },
      include: DEFAULT_INCLUDE,
    }) as Promise<ProductWithRelations | null>,
    null
  )
}
export const getProductBySlug = (slug: string) => {
  const getCached = cache(
    safeUnstableCache(
      async (s: string) => getProductBySlugRaw(s),
      ['product-by-slug'],
      { tags: ['products'] }
    )
  )
  return getCached(slug)
}

// 10. Related Products
const getRelatedProductsRaw = (
  categoryIds: string[],
  excludeProductId: string,
  limit = 4
): Promise<ProductWithRelations[]> => {
  if (categoryIds.length === 0) return Promise.resolve([])
  return safeQuery(
    prisma.product.findMany({
      where: {
        status: { in: ['PUBLISHED', 'SOLD_OUT'] },
        id: { not: excludeProductId },
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      include: SEARCH_INCLUDE,
      take: limit,
    }) as Promise<ProductWithRelations[]>,
    []
  )
}
export const getRelatedProducts = (
  categoryIds: string[],
  excludeProductId: string,
  limit = 4
) => {
  const getCached = cache(
    safeUnstableCache(
      async (cIdsStr: string, exId: string, lim: number) => {
        const cIds = cIdsStr ? cIdsStr.split(',') : []
        return getRelatedProductsRaw(cIds, exId, lim)
      },
      ['related-products'],
      { tags: ['products', 'related-products'] }
    )
  )
  const sortedIdsStr = [...categoryIds].sort().join(',')
  return getCached(sortedIdsStr, excludeProductId, limit)
}
