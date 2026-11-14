import { getPublishedProducts } from '@/lib/queries'
import { SITE_URL, absoluteUrl } from '@/lib/seo/site'
import { escapeXml, sanitizeXmlText } from '@/lib/seo/xml'

/**
 * Image sitemap.
 *
 * Next.js 14.2's `MetadataRoute.Sitemap` has no `images` field, so product
 * imagery gets its own sitemap. This is the cheapest way to get product photos
 * into Google Images, which is a real discovery surface for collector items
 * ("hot wheels premium mercedes 300 sl" style queries).
 */
export const revalidate = 3600

export async function GET() {
  const products = await getPublishedProducts()

  // A `<url>` with no `<image:image>` is invalid for this sitemap type, so
  // image-less products are dropped entirely rather than emitted bare.
  const urls = products
    .filter((product) => product.images.length > 0)
    .map((product) => {
      const pageUrl = `${SITE_URL}/product/${product.slug}`
      const images = product.images
        .map((image) => {
          const loc = absoluteUrl(image.imageUrl)
          const title = sanitizeXmlText(image.altText || product.title)
          const caption = sanitizeXmlText(
            product.shortDesc || product.description || product.title
          ).slice(0, 200)

          return [
            '    <image:image>',
            `      <image:loc>${escapeXml(loc)}</image:loc>`,
            `      <image:title>${escapeXml(title)}</image:title>`,
            caption ? `      <image:caption>${escapeXml(caption)}</image:caption>` : '',
            '    </image:image>',
          ]
            .filter(Boolean)
            .join('\n')
        })
        .join('\n')

      return [
        '  <url>',
        `    <loc>${escapeXml(pageUrl)}</loc>`,
        `    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>`,
        images,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
