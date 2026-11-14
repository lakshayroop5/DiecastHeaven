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
 * - PRE_ORDER items are skipped: this catalogue has no `availabilityDate` field,
 *   and Merchant Center requires `g:availability_date` for preorders. Upgrade
 *   path: add `availabilityDate` to the Product model, then emit
 *   `g:availability_date` and let these items back in.
 * - `identifier_exists=no` because this catalogue has no GTIN/MPN identifiers.
 *   Inventing an MPN from the slug would be a misrepresentation.
 * - `g:brand` is emitted only when the catalogue names a brand; that value is
 *   factual product data, not a merchant-issued identifier.
 * - `g:shipping` and `g:return_policy` are intentionally absent: the business
 *   quotes shipping on WhatsApp and has no published return policy. Without
 *   them items are not eligible for free listings - this feed makes no such
 *   claim. See docs/seo/roadmap.md.
 */

const GOOGLE_PRODUCT_CATEGORY =
  // Verified Google product taxonomy leaf 3551: "Toys & Games > Toys > Play
  // Vehicles > Toy Cars". "Toy Cars & Trucks" is not a taxonomy node.
  process.env.GOOGLE_PRODUCT_CATEGORY || 'Toys & Games > Toys > Play Vehicles > Toy Cars'

/** Merchant Center wants `<amount> <CURRENCY>`, e.g. `599.00 INR`. */
function formatFeedPrice(amount: number): string {
  return `${amount.toFixed(2)} ${CURRENCY}`
}

function feedItem(product: ProductWithRelations): string | null {
  const price = sellingPrice(product)
  const image = product.images[0]?.imageUrl
  if (price == null || !image) return null

  // No `availabilityDate` exists on Product, and Merchant Center rejects a
  // preorder without `g:availability_date`. Skip rather than emit an
  // incomplete availability declaration.
  if (product.orderType === 'PRE_ORDER') return null

  // `g:price` is the regular/list price; `g:sale_price` is the discounted price.
  // When no valid list price exists, the selling price is the only honest value.
  const listPrice = product.price != null && product.price > 0 ? product.price : null
  const salePrice =
    listPrice != null &&
    product.offerPrice != null &&
    product.offerPrice > 0 &&
    product.offerPrice < listPrice
      ? product.offerPrice
      : null
  const primaryPrice = salePrice != null && listPrice != null ? listPrice : price

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
    `      <g:availability>${
      product.status === 'SOLD_OUT' ? 'out_of_stock' : 'in_stock'
    }</g:availability>`,
    `      <g:price>${formatFeedPrice(primaryPrice)}</g:price>`,
    salePrice != null ? `      <g:sale_price>${formatFeedPrice(salePrice)}</g:sale_price>` : false,
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
