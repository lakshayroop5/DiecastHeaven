import { MetadataRoute } from 'next'
import { getPublishedProducts } from '@/lib/queries'
import { POLICIES } from '@/lib/policies'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.diecastheavenudaipur.in'
  
  const [products] = await Promise.all([
    getPublishedProducts(),
  ])

  const productUrls = products.map((product) => {
    const rawImage = product.images[0]?.imageUrl
    const absoluteImage = rawImage
      ? rawImage.startsWith('http')
        ? rawImage
        : `${baseUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`
      : undefined
    return {
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      ...(absoluteImage ? { images: [absoluteImage] } : {}),
    }
  })

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...POLICIES.map(({ slug }) => ({
      url: `${baseUrl}/policies/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
    ...productUrls,
  ]
}