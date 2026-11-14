/**
 * Schema.org (JSON-LD) builders.
 *
 * Design rules for this site:
 * - Only emit facts we actually know. No invented ratings, reviews, GTINs,
 *   shipping costs or return windows - Google treats fabricated values as a
 *   policy violation, and a missing property is always better than a wrong one.
 * - Every URL and image is absolute, because the canonical host is www.
 * - Products without a price get no `offers` at all rather than a fake one.
 */

import type { ProductWithRelations } from '@/lib/types'
import { BUSINESS, CURRENCY, SITE_NAME, SITE_URL, absoluteUrl } from './site'

export type JsonLdNode = Record<string, unknown>

const SCHEMA_ORG = 'https://schema.org'

/* -------------------------------------------------------------------------- */
/* Availability                                                               */
/* -------------------------------------------------------------------------- */

/**
 * `stock` is not a reliable availability signal on this site - it defaults to 0
 * and is not maintained per unit, while `status` is what the storefront actually
 * sells by. So availability is derived from `status` + `orderType` only.
 */
export function availabilityFor(product: Pick<ProductWithRelations, 'status' | 'orderType'>): string {
  if (product.status === 'SOLD_OUT') return `${SCHEMA_ORG}/SoldOut`
  if (product.orderType === 'PRE_ORDER') return `${SCHEMA_ORG}/PreOrder`
  return `${SCHEMA_ORG}/InStock`
}

/** The price a customer actually pays. */
export function sellingPrice(product: Pick<ProductWithRelations, 'price' | 'offerPrice'>): number | null {
  if (product.offerPrice != null && product.offerPrice > 0) return product.offerPrice
  if (product.price != null && product.price > 0) return product.price
  return null
}

/* -------------------------------------------------------------------------- */
/* Products                                                                   */
/* -------------------------------------------------------------------------- */

export function productUrl(slug: string): string {
  return `${SITE_URL}/product/${slug}`
}

export function productSchema(product: ProductWithRelations): JsonLdNode {
  const url = productUrl(product.slug)
  const images = product.images
    .map((image) => absoluteUrl(image.imageUrl))
    .filter(Boolean)
  const price = sellingPrice(product)
  const brandName = product.brand?.name ?? null
  const categoryNames = product.categories.map(({ category }) => category.name)

  const node: JsonLdNode = {
    '@context': SCHEMA_ORG,
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.title,
    url,
    // The slug is the only stable merchant-defined identifier this schema has.
    sku: product.slug,
    ...(product.description || product.shortDesc
      ? { description: (product.description || product.shortDesc || '').trim() }
      : {}),
    ...(images.length ? { image: images } : {}),
    ...(brandName ? { brand: { '@type': 'Brand', name: brandName } } : {}),
    // Google reads `category` as a single product category. Joining unrelated
    // categories with ' > ' would invent a taxonomy that does not exist - the
    // primary category is the honest value.
    ...(categoryNames.length ? { category: categoryNames[0] } : {}),
    itemCondition: `${SCHEMA_ORG}/NewCondition`,
    ...(product.scale
      ? {
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Scale',
              value: product.scale,
            },
          ],
        }
      : {}),
  }

  // No price means no Offer. A Product node without offers is still valid
  // structured data; it is simply not eligible for merchant listing features.
  if (price != null) {
    node.offers = {
      '@type': 'Offer',
      '@id': `${url}#offer`,
      url,
      price,
      priceCurrency: CURRENCY,
      availability: availabilityFor(product),
      itemCondition: `${SCHEMA_ORG}/NewCondition`,
      seller: { '@id': `${SITE_URL}/#organization` },
      ...(product.offerPrice != null &&
      product.price != null &&
      product.offerPrice < product.price
        ? {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: product.price,
              priceCurrency: CURRENCY,
              // Google only recognises StrikethroughPrice here; ListPrice is
              // not a value it documents and is silently ignored.
              priceType: `${SCHEMA_ORG}/StrikethroughPrice`,
            },
          }
        : {}),
    }
  }

  return node
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export function breadcrumbSchema(items: Array<{ name: string; path: string }>): JsonLdNode {
  return {
    '@context': SCHEMA_ORG,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function itemListSchema(
  products: Array<Pick<ProductWithRelations, 'slug' | 'title'>>,
  options: { url: string; name: string }
): JsonLdNode {
  return {
    '@context': SCHEMA_ORG,
    '@type': 'ItemList',
    '@id': `${absoluteUrl(options.url)}#itemlist`,
    name: options.name,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: productUrl(product.slug),
      name: product.title,
    })),
  }
}

/* -------------------------------------------------------------------------- */
/* Site-level entities                                                        */
/* -------------------------------------------------------------------------- */

export function organizationSchema(): JsonLdNode {
  return {
    '@context': SCHEMA_ORG,
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    description: BUSINESS.description,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(BUSINESS.logoPath),
    },
    image: absoluteUrl(BUSINESS.logoPath),
    telephone: BUSINESS.telephone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.address.addressLocality,
      addressRegion: BUSINESS.address.addressRegion,
      addressCountry: BUSINESS.address.addressCountry,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: BUSINESS.telephone,
        areaServed: 'IN',
        availableLanguage: ['en', 'hi'],
      },
    ],
    ...(BUSINESS.sameAs.length ? { sameAs: BUSINESS.sameAs } : {}),
  }
}

export function localBusinessSchema(): JsonLdNode {
  return {
    '@context': SCHEMA_ORG,
    '@type': 'Store',
    '@id': `${SITE_URL}/#store`,
    name: BUSINESS.name,
    url: SITE_URL,
    image: absoluteUrl(BUSINESS.logoPath),
    description: BUSINESS.description,
    telephone: BUSINESS.telephone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.address.addressLocality,
      addressRegion: BUSINESS.address.addressRegion,
      addressCountry: BUSINESS.address.addressCountry,
    },
    areaServed: { '@type': 'Country', name: BUSINESS.areaServed },
    openingHours: BUSINESS.openingHours,
    currenciesAccepted: CURRENCY,
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
  }
}

export function websiteSchema(): JsonLdNode {
  return {
    '@context': SCHEMA_ORG,
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: BUSINESS.description,
    inLanguage: 'en-IN',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/catalog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** Combined graph for the root layout - one <script> tag, three entities. */
export function siteGraphSchema(): JsonLdNode {
  const withoutContext = ({ '@context': _context, ...node }: JsonLdNode): JsonLdNode => node

  return {
    '@context': SCHEMA_ORG,
    '@graph': [
      withoutContext(organizationSchema()),
      withoutContext(localBusinessSchema()),
      withoutContext(websiteSchema()),
    ],
  }
}
