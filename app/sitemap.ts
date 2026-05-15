import { MetadataRoute } from 'next'
import { getPublishedProducts } from '@/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const [products] = await Promise.all([
    getPublishedProducts(),
  ])

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

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
    ...productUrls,
  ]
}