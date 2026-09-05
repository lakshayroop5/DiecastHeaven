'use client'

import Link from 'next/link'
import type { NameCount, NewProduct, RecentEvent, TopProduct } from '@/lib/analytics'

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(mo / 12)}y ago`
}

/** Simple horizontal bar list — categories, brands, searches, filters. */
export function BarList({ items, emptyText = 'No data yet.' }: { items: NameCount[]; emptyText?: string }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">{emptyText}</p>
  }
  const max = items[0].count
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.name}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
            <span className="truncate text-gray-200">{item.name}</span>
            <span className="font-semibold text-hotwheels-yellow">{item.count.toLocaleString('en-IN')}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-hotwheels-black">
            <div
              className="h-full rounded-full bg-hotwheels-red"
              style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function TopProductsTable({ items }: { items: TopProduct[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No product interest yet.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-hotwheels-black text-left text-xs uppercase tracking-wider text-gray-400">
            <th className="pb-2 pr-2 font-semibold">#</th>
            <th className="pb-2 pr-2 font-semibold">Product</th>
            <th className="pb-2 pr-2 font-semibold">Type</th>
            <th className="pb-2 pr-2 text-right font-semibold">Views</th>
            <th className="pb-2 pr-2 text-right font-semibold">Clicks</th>
            <th className="pb-2 pr-2 text-right font-semibold">WhatsApp</th>
            <th className="pb-2 text-right font-semibold">Cart</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p, i) => (
            <tr key={p.key} className="border-b border-hotwheels-black/50 transition-colors hover:bg-hotwheels-black/40">
              <td className="py-2.5 pr-2 text-gray-500">{i + 1}</td>
              <td className="max-w-[260px] py-2.5 pr-2">
                {p.slug ? (
                  <Link
                    href={`/product/${p.slug}`}
                    target="_blank"
                    className="block truncate font-medium text-hotwheels-white hover:text-hotwheels-yellow"
                    title={p.title}
                  >
                    {p.title}
                  </Link>
                ) : (
                  <span className="block truncate text-gray-300" title={p.title}>{p.title}</span>
                )}
              </td>
              <td className="py-2.5 pr-2">
                {p.featured ? (
                  <span className="rounded bg-hotwheels-red px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    Featured
                  </span>
                ) : (
                  <span className="rounded border border-hotwheels-gray px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-400">
                    Standard
                  </span>
                )}
              </td>
              <td className="py-2.5 pr-2 text-right font-semibold text-white">{p.views.toLocaleString('en-IN')}</td>
              <td className="py-2.5 pr-2 text-right text-gray-300">{p.clicks.toLocaleString('en-IN')}</td>
              <td className="py-2.5 pr-2 text-right text-green-400">{p.whatsappClicks.toLocaleString('en-IN')}</td>
              <td className="py-2.5 text-right text-pink-400">{p.cartAdds.toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function NewProductsList({ items }: { items: NewProduct[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No products yet.</p>
  }
  return (
    <ul className="divide-y divide-hotwheels-black/50">
      {items.map((p) => (
        <li key={p.slug} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <Link
              href={`/product/${p.slug}`}
              target="_blank"
              className="block truncate text-sm font-medium text-hotwheels-white hover:text-hotwheels-yellow"
              title={p.title}
            >
              {p.title}
            </Link>
            <p className="text-xs text-gray-500">
              added {timeAgo(p.createdAt)}
              {p.featured ? ' · featured' : ''}
            </p>
          </div>
          <span className="flex-shrink-0 text-sm font-semibold text-hotwheels-yellow">
            {p.views.toLocaleString('en-IN')} <span className="text-xs font-normal text-gray-500">views</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

const EVENT_STYLES: Record<string, string> = {
  PAGE_VIEW: 'bg-gray-500/15 text-gray-300',
  PRODUCT_VIEW: 'bg-hotwheels-yellow/15 text-hotwheels-yellow',
  PRODUCT_CLICK: 'bg-blue-500/15 text-blue-300',
  WHATSAPP_CLICK: 'bg-green-500/15 text-green-300',
  ADD_TO_CART: 'bg-pink-500/15 text-pink-300',
  CART_CHECKOUT: 'bg-hotwheels-red/20 text-red-300',
  SEARCH: 'bg-indigo-500/15 text-indigo-300',
  FILTER_APPLY: 'bg-gray-500/15 text-gray-300',
}

const EVENT_LABELS: Record<string, string> = {
  PAGE_VIEW: 'View',
  PRODUCT_VIEW: 'Product',
  PRODUCT_CLICK: 'Click',
  WHATSAPP_CLICK: 'WhatsApp',
  ADD_TO_CART: 'Cart',
  CART_CHECKOUT: 'Checkout',
  SEARCH: 'Search',
  FILTER_APPLY: 'Filter',
}

function eventDetail(e: RecentEvent): string {
  if (e.productTitle) return e.productTitle
  if (e.searchQuery) return `"${e.searchQuery}"`
  if (e.eventType === 'CART_CHECKOUT' && e.meta) {
    try {
      const parsed: unknown = JSON.parse(e.meta)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const m = parsed as { totalItems?: unknown; subtotal?: unknown }
        const items = typeof m.totalItems === 'number' ? m.totalItems : null
        const subtotal = typeof m.subtotal === 'number' ? m.subtotal : null
        if (items !== null && subtotal !== null) {
          return `${items} item${items === 1 ? '' : 's'} · ₹${subtotal.toLocaleString('en-IN')}`
        }
      }
    } catch {
      // fall through to the plain-meta / source fallbacks below
    }
  }
  if (e.eventType === 'FILTER_APPLY' && e.meta) {
    return e.meta.split('|').join(' · ').replace(/:/g, ': ')
  }
  if (e.eventType === 'PAGE_VIEW') {
    return e.source ? e.source.replace(/^\//, '').replace(/\//g, ' › ') || 'home' : 'page'
  }
  return e.source ?? '—'
}

export function RecentEventsFeed({ items }: { items: RecentEvent[] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No events in this range — they appear as visitors browse.</p>
  }
  return (
    <ul className="max-h-96 divide-y divide-hotwheels-black/50 overflow-y-auto pr-1">
      {items.map((e, i) => (
        <li key={i} className="flex items-center gap-3 py-2">
          <span
            className={`w-20 flex-shrink-0 rounded px-1.5 py-0.5 text-center text-[10px] font-bold uppercase tracking-wide ${EVENT_STYLES[e.eventType] ?? 'bg-gray-500/15 text-gray-300'}`}
          >
            {EVENT_LABELS[e.eventType] ?? e.eventType.replace(/_/g, ' ')}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-gray-200" title={eventDetail(e)}>
            {eventDetail(e)}
          </span>
          <span className="flex-shrink-0 text-xs text-gray-500">{timeAgo(e.createdAt)}</span>
        </li>
      ))}
    </ul>
  )
}
