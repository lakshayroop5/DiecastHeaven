/**
 * Canonical site identity + URL helpers.
 *
 * Every absolute URL the site emits (canonicals, Open Graph, JSON-LD, sitemaps,
 * the merchant feed) must come from here so they can never drift apart again.
 *
 * History: `NEXT_PUBLIC_SITE_URL` was never set in production, so sitemap.ts and
 * robots.ts silently fell back to `http://localhost:3000` and shipped 225
 * localhost URLs to Google. The production fallback below is deliberate.
 */

export const PRODUCTION_HOST = 'www.diecastheavenudaipur.in'

/** Hosts that can only ever be a local dev server's origin. */
const LOOPBACK_HOSTS: Record<string, true> = {
  localhost: true,
  '127.0.0.1': true,
  '0.0.0.0': true,
  '::1': true,
}

/**
 * The canonical origin. The apex domain 308-redirects to www (and the TLS
 * certificate only covers www), so www is the canonical host.
 *
 * `NEXT_PUBLIC_SITE_URL` is inlined at build time, so a stray dev value (e.g.
 * `.env.production.local` with `http://localhost:3000`) would poison every
 * canonical, OG tag, robots host and sitemap loc. In a production build such a
 * value is ignored and the www default wins. Development keeps localhost.
 */
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (raw) {
    try {
      const url = new URL(raw)
      // IPv6 hostnames keep their brackets in `URL.hostname` (`[::1]`).
      const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
      if (!(LOOPBACK_HOSTS[host] && process.env.NODE_ENV === 'production')) {
        // Collapse the apex onto the canonical www host so canonicals never point
        // at a URL that immediately redirects.
        if (url.hostname === 'diecastheavenudaipur.in') {
          url.hostname = PRODUCTION_HOST
        }
        return url.origin
      }
    } catch {
      // Malformed value - fall through to the production default.
    }
  }

  return `https://${PRODUCTION_HOST}`
}

export const SITE_URL = resolveSiteUrl()

export const SITE_NAME = 'Diecast Heaven Udaipur'
export const SITE_SHORT_NAME = 'Diecast Heaven'
export const SITE_LOCALE = 'en_IN'
export const SITE_LANG = 'en-IN'
export const CURRENCY = 'INR'

export const BUSINESS = {
  name: SITE_NAME,
  legalName: 'Diecast Heaven Udaipur',
  description:
    'Diecast Heaven Udaipur is an Indian retailer of premium diecast collector cars — Hot Wheels, Hot Wheels Premium, Hot Wheels Silver Series, Majorette, Matchbox, Bburago, Tomica, Tarmac Works and Pop Race — shipping across India.',
  telephone: '+919079674984',
  whatsapp: '919079674984',
  email: null as string | null,
  address: {
    streetAddress: 'BVR Super Mart, Block-E, 335, near Goverdhan Villas, Transport Nagar, Hiran Magri',
    addressLocality: 'Udaipur',
    addressRegion: 'Rajasthan',
    postalCode: '313001',
    addressCountry: 'IN',
  },
  geo: { latitude: 24.532529404548388, longitude: 73.68694965767143 },
  mapUrl: 'https://maps.app.goo.gl/3C6nyt5BbfqXL3hdA',
  priceRange: '₹₹',
  areaServed: 'India',
  openingHours: ['Mo-Sa 10:00-20:00', 'Su 10:00-18:00'],
  openingHoursSpecification: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '10:00', closes: '20:00' },
    { days: ['Sunday'], opens: '10:00', closes: '18:00' },
  ],
  logoPath: '/diecast-heaven-logo.png',
  sameAs: [
    'https://www.instagram.com/diecast_heaven_udaipur/',
    'https://www.youtube.com/@diecastheaven-udaipur',
  ],
} as const

/** Absolute URL for a site-relative path. Leaves already-absolute URLs alone. */
export function absoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return SITE_URL
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

/**
 * The social card used by every page that has no image of its own. Deliberately
 * no width/height: a declared size that does not match the asset is worse than
 * none, and Next then infers dimensions from the file.
 */
export function defaultOgImage(): { url: string; alt: string } {
  return { url: absoluteUrl(BUSINESS.logoPath), alt: `${SITE_NAME} logo` }
}

/** Site-relative path for an absolute URL on this host; passes through otherwise. */
export function relativePath(url: string): string {
  if (!url) return '/'
  if (url.startsWith(SITE_URL)) return url.slice(SITE_URL.length) || '/'
  return url
}

/** Absolute image URL with a guaranteed extension, for feeds and structured data. */
export function absoluteImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null
  return absoluteUrl(imageUrl)
}

/** Truncate on a word boundary, never mid-word, never mid-entity. */
export function truncate(text: string | null | undefined, max = 158): string {
  if (!text) return ''
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\-–—]$/, '')}…`
}
