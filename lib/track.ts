export const ANALYTIC_EVENT_TYPES = [
  'PAGE_VIEW',
  'PRODUCT_VIEW',
  'PRODUCT_CLICK',
  'WHATSAPP_CLICK',
  'ADD_TO_CART',
  'CART_CHECKOUT',
  'SEARCH',
  'FILTER_APPLY',
] as const

export type AnalyticsEventType = (typeof ANALYTIC_EVENT_TYPES)[number]

export interface TrackPayload {
  eventType: AnalyticsEventType
  productId?: string
  productSlug?: string
  productTitle?: string
  brand?: string
  category?: string
  featured?: boolean
  orderType?: string
  source?: string
  searchQuery?: string
  meta?: string
}

const BOT_UA = /bot|crawl|spider|preview|lighthouse|headless/i

/**
 * Fire-and-forget analytics beacon. Never awaited, never throws —
 * tracking must not be able to break the UI. Bots/crawlers/preview
 * renderers are skipped so they don't pollute visitor counts.
 */
export function track(e: TrackPayload): void {
  try {
    if (typeof navigator !== 'undefined' && BOT_UA.test(navigator.userAgent)) return
    const body = JSON.stringify(e)
    if (body.length > 2000) return
    void fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // analytics failures are silent by design
    })
  } catch {
    // ditto
  }
}
