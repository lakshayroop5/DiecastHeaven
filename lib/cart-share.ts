// ponytail: cart rides in link as `id.qty` pairs. No DB table, no API, no expiry.
const MAX_ITEMS = 50
const ID_RE = /^[a-z0-9]+$/i

export interface SharedCartEntry {
  id: string
  qty: number
}

export function encodeCart(items: Array<{ id: string; quantity: number }>): string {
  return items
    .slice(0, MAX_ITEMS)
    .filter((i) => ID_RE.test(i.id))
    .map((i) => `${i.id}.${Math.min(99, Math.max(1, Math.floor(i.quantity) || 1))}`)
    .join('-')
}

export function decodeCart(payload: string | null | undefined): SharedCartEntry[] {
  if (!payload) return []
  const out: SharedCartEntry[] = []
  for (const part of payload.split('-').slice(0, MAX_ITEMS)) {
    const dot = part.lastIndexOf('.')
    if (dot < 1) continue
    const id = part.slice(0, dot)
    const qty = parseInt(part.slice(dot + 1), 10)
    if (!ID_RE.test(id) || !Number.isFinite(qty)) continue
    out.push({ id, qty: Math.min(99, Math.max(1, qty)) })
  }
  return out
}

export function buildSharedCartUrl(base: string, items: Array<{ id: string; quantity: number }>): string {
  const payload = encodeCart(items)
  if (!payload) return `${base.replace(/\/$/, '')}/cart`
  return `${base.replace(/\/$/, '')}/cart/shared?c=${payload}`
}
