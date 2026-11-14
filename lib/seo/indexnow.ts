import { SITE_URL, PRODUCTION_HOST } from './site'

/**
 * IndexNow tells Bing (and other participating engines) that a URL changed, so
 * new stock gets crawled in minutes instead of on the next crawl cycle.
 *
 * Google does NOT participate in IndexNow - Google's Indexing API is restricted
 * to JobPosting and BroadcastEvent, so it cannot be used for products. Google
 * discovery relies on the sitemap plus internal links.
 */

// Rotate by setting INDEXNOW_KEY and re-creating public/<key>.txt with the same value.
export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '8f2c4a6e1b9d73054ce8a1f6b2d90e37'

export const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

export async function submitToIndexNow(urls: string[]): Promise<{ ok: boolean; status?: number }> {
  const urlList = Array.from(new Set(urls.filter(Boolean))).slice(0, 10000)
  if (urlList.length === 0) return { ok: false }

  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: PRODUCTION_HOST,
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        urlList,
      }),
      // Never let a search-engine ping hold up an admin save.
      signal: AbortSignal.timeout(5000),
    })

    return { ok: response.ok, status: response.status }
  } catch {
    return { ok: false }
  }
}

/** The URLs that change whenever the catalogue does. */
export function coreCatalogueUrls(): string[] {
  return [`${SITE_URL}/`, `${SITE_URL}/catalog`, `${SITE_URL}/brands`]
}
