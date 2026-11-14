import type { ProductWithRelations } from '@/lib/types'
import { BUSINESS, CURRENCY, SITE_NAME, SITE_URL, absoluteUrl } from './site'
import { escapeXml, sanitizeXmlText } from './xml'
import { sellingPrice } from './schema'

/**
 * Google Merchant Center product feed (RSS 2.0 + the `g:` namespace).
 *
 * Scope decisions, all deliberate:
 * - Products without a price OR without an image are skipped. Merchant Center
 *   rejects them anyway, and a feed full of rejected items hides the real errors.
 * - `identifier_exists=no` because this catalogue has no GTIN/MPN/brand-issued
 *   identifiers. Claiming otherwise would be a misrepresentation.
 * - `g:shipping` and `g:return_policy` are intentionally absent: the business
 *   quotes shipping on WhatsApp and has no published return policy. Merchant
 *   Center needs both to serve free listings, so this feed is only half of the
 *   eligibility work - see docs/seo/roadmap.md.
 */

const GOOGLE_PRODUCT_CATEGORY =
  process.env.GOOGLE_PRODUCT_CATEGORY || 'Toys & Games > Toys > Play Vehicles > Toy Cars & Trucks'

function availability(product: ProductWithRelations): string {
  if (product.status === 'SOLD_OUT') return 'out_of_stock'
  if (product.orderType === 'PRE_ORDER') return 'preorder'
  return 'in_stock'
}

/** Merchant Center wants `<amount> <CURRENCY>`, e.g. `599.00 INR`. */
function formatFeedPrice(amount: number): string {
  return `${amount.toFixed(2)} ${CURRENCY}`
}

function feedItem(product: ProductWithRelations): string | null {
  const price = sellingPrice(product)
  const image = product.images[0]?.imageUrl
  if (price == null || !image) return null

  const link = `${SITE_URL}/product/${product.slug}`
  const title = sanitizeXmlText(product.title).slice(0, 150)
  const description = sanitizeXmlText(
    product.description || product.shortDesc || product.title
  ).slice(0, 5000)
  const additionalImages = product.images
    .slice(1, 11)
    .map((img) => absoluteUrl(img.imageUrl))

  const lines: Array<string | false> = [
    '    <item>',
    `      <g:id>${escapeXml(product.slug)}</g:id>`,
    `      <title>${escapeXml(title)}</title>`,
    `      <description>${escapeXml(description)}</description>`,
    `      <link>${escapeXml(link)}</link>`,
    `      <g:image_link>${escapeXml(absoluteUrl(image))}</g:image_link>`,
    ...additionalImages.map(
      (url) => `      <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`
    ),
    `      <g:availability>${availability(product)}</g:availability>`,
    `      <g:price>${formatFeedPrice(product.price ?? price)}</g:price>`,
    product.offerPrice != null && product.price != null && product.offerPrice < product.price
      ? `      <g:sale_price>${formatFeedPrice(product.offerPrice)}</g:sale_price>`
      : false,
    '      <g:condition>new</g:condition>',
    product.brand?.name ? `      <g:brand>${escapeXml(product.brand.name)}</g:brand>` : false,
    '      <g:identifier_exists>no</g:identifier_exists>',
    `      <g:google_product_category>${escapeXml(GOOGLE_PRODUCT_CATEGORY)}</g:google_product_category>`,
    product.brand?.name || product.categories.length
      ? `      <g:product_type>${escapeXml(
          [product.brand?.name, ...product.categories.map(({ category }) => category.name)]
            .filter(Boolean)
            .join(' > ')
        )}</g:product_type>`
      : false,
    product.scale ? `      <g:size>${escapeXml(product.scale)}</g:size>` : false,
    `      <g:mpn>${escapeXml(product.slug)}</g:mpn>`,
    '    </item>',
  ]

  return lines.filter(Boolean).join('\n')
}

export function buildMerchantFeed(products: ProductWithRelations[]): {
  xml: string
  included: number
  skipped: number
} {
  const items = products.map(feedItem).filter((item): item is string => Boolean(item))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SITE_NAME)} - Product Feed</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(BUSINESS.description)}</description>
${items.join('\n')}
  </channel>
</rss>`

  return { xml, included: items.length, skipped: products.length - items.length }
}
