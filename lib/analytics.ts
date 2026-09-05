import prisma from './prisma'
import { addDays, istDay, istToday, rangeFromDays, type DateRange } from './analytics-dates'

export { addDays, istDay, istToday, rangeFromDays, spanDays } from './analytics-dates'
export type { DateRange } from './analytics-dates'

/** IST hour label "HH:00" for a moment. */
function istHour(d: Date): string {
  return new Date(d.getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(11, 13) + ':00'
}

/** UTC instants covering the IST range [from 00:00 IST, to 23:59:59.999 IST]. */
function rangeWindow(range: DateRange): { start: Date; end: Date } {
  return {
    start: new Date(`${range.from}T00:00:00+05:30`),
    end: new Date(`${range.to}T23:59:59.999+05:30`),
  }
}

export interface AnalyticsKpis {
  visitors: number
  pageViews: number
  productViews: number
  productClicks: number
  whatsappClicks: number
  addToCart: number
  checkouts: number
  searches: number
  totalPublishedProducts: number
  productsWithInterest: number
}

export interface TimeseriesPoint {
  date: string
  pageViews: number
  productViews: number
  productClicks: number
  whatsappClicks: number
  addToCart: number
}

export interface TopProduct {
  key: string
  title: string
  slug: string | null
  featured: boolean
  views: number
  clicks: number
  whatsappClicks: number
  cartAdds: number
}

export interface NameCount {
  name: string
  count: number
}

export interface QueryCount {
  query: string
  count: number
}

export interface FeaturedSplit {
  featuredViews: number
  normalViews: number
  featuredClicks: number
  normalClicks: number
}

export interface RecentEvent {
  eventType: string
  productTitle: string | null
  searchQuery: string | null
  source: string | null
  meta: string | null
  createdAt: string
}

export interface NewProduct {
  title: string
  slug: string
  featured: boolean
  createdAt: string
  views: number
}

export interface AnalyticsSummary {
  rangeFrom: string
  rangeTo: string
  /** true when from == to — timeseries is hourly (IST) instead of daily. */
  hourly: boolean
  kpis: AnalyticsKpis
  timeseries: TimeseriesPoint[]
  topProducts: TopProduct[]
  featuredSplit: FeaturedSplit
  categoryBreakdown: NameCount[]
  brandBreakdown: NameCount[]
  searchTerms: QueryCount[]
  filterUsage: NameCount[]
  recentEvents: RecentEvent[]
  newProducts: NewProduct[]
}

export interface DailyCount {
  date: string
  views: number
  visitors: number
}

const INTEREST_TYPES = new Set(['PRODUCT_VIEW', 'PRODUCT_CLICK', 'WHATSAPP_CLICK', 'ADD_TO_CART'])

function zeroTimeseriesDaily(range: DateRange): TimeseriesPoint[] {
  const out: TimeseriesPoint[] = []
  for (let d = range.from; d <= range.to; d = addDays(d, 1)) {
    out.push({ date: d, pageViews: 0, productViews: 0, productClicks: 0, whatsappClicks: 0, addToCart: 0 })
  }
  return out
}

function zeroTimeseriesHourly(): TimeseriesPoint[] {
  const out: TimeseriesPoint[] = []
  for (let h = 0; h < 24; h++) {
    out.push({ date: `${String(h).padStart(2, '0')}:00`, pageViews: 0, productViews: 0, productClicks: 0, whatsappClicks: 0, addToCart: 0 })
  }
  return out
}

function emptySummary(range: DateRange, hourly: boolean): AnalyticsSummary {
  return {
    rangeFrom: range.from,
    rangeTo: range.to,
    hourly,
    kpis: {
      visitors: 0,
      pageViews: 0,
      productViews: 0,
      productClicks: 0,
      whatsappClicks: 0,
      addToCart: 0,
      checkouts: 0,
      searches: 0,
      totalPublishedProducts: 0,
      productsWithInterest: 0,
    },
    timeseries: hourly ? zeroTimeseriesHourly() : zeroTimeseriesDaily(range),
    topProducts: [],
    featuredSplit: { featuredViews: 0, normalViews: 0, featuredClicks: 0, normalClicks: 0 },
    categoryBreakdown: [],
    brandBreakdown: [],
    searchTerms: [],
    filterUsage: [],
    recentEvents: [],
    newProducts: [],
  }
}

/**
 * ponytail: aggregates in JS over the windowed rows — zero raw-SQL/BigInt/
 * strftime risk across SQLite + Turso. Ceiling ~100k events in window;
 * upgrade path is a SQL day-bucket rollup table if it ever gets slow.
 */
export async function getAnalyticsSummary(range: DateRange): Promise<AnalyticsSummary> {
  const hourly = range.from === range.to
  const { start, end } = rangeWindow(range)

  try {
    const [events, totalPublishedProducts, recentRows, newProductRows] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: {
          eventType: true,
          visitorId: true,
          productSlug: true,
          productTitle: true,
          brand: true,
          category: true,
          featured: true,
          searchQuery: true,
          meta: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.product.count({ where: { status: { in: ['PUBLISHED', 'SOLD_OUT'] } } }),
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: start, lte: end } },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: {
          eventType: true,
          productTitle: true,
          searchQuery: true,
          source: true,
          meta: true,
          createdAt: true,
        },
      }),
      prisma.product.findMany({
        where: { status: { in: ['PUBLISHED', 'SOLD_OUT'] } },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: { title: true, slug: true, featured: true, createdAt: true },
      }),
    ])

    const count = (t: string): number => events.filter((e) => e.eventType === t).length

    const visitors = new Set(events.map((e) => e.visitorId)).size
    const interestKeys = new Set(
      events
        .filter((e) => INTEREST_TYPES.has(e.eventType))
        .map((e) => e.productSlug ?? e.productTitle)
        .filter((k): k is string => Boolean(k))
    )

    // Zero-filled timeseries — hourly buckets for single-day, daily otherwise
    const series = new Map<string, TimeseriesPoint>()
    for (const point of hourly ? zeroTimeseriesHourly() : zeroTimeseriesDaily(range)) {
      series.set(point.date, point)
    }
    for (const e of events) {
      const point = series.get(hourly ? istHour(e.createdAt) : istDay(e.createdAt))
      if (!point) continue
      switch (e.eventType) {
        case 'PAGE_VIEW':
          point.pageViews++
          break
        case 'PRODUCT_VIEW':
          point.productViews++
          break
        case 'PRODUCT_CLICK':
          point.productClicks++
          break
        case 'WHATSAPP_CLICK':
          point.whatsappClicks++
          break
        case 'ADD_TO_CART':
          point.addToCart++
          break
        default:
          break
      }
    }

    // Per-product interest table (keyed slug, fallback title for WhatsApp clicks)
    const productMap = new Map<string, TopProduct>()
    for (const e of events) {
      if (!INTEREST_TYPES.has(e.eventType)) continue
      const key = e.productSlug ?? e.productTitle
      if (!key) continue
      let row = productMap.get(key)
      if (!row) {
        row = {
          key,
          title: e.productTitle ?? key,
          slug: e.productSlug ?? null,
          featured: false,
          views: 0,
          clicks: 0,
          whatsappClicks: 0,
          cartAdds: 0,
        }
        productMap.set(key, row)
      }
      if (e.featured) row.featured = true
      if (e.eventType === 'PRODUCT_VIEW') row.views++
      else if (e.eventType === 'PRODUCT_CLICK') row.clicks++
      else if (e.eventType === 'WHATSAPP_CLICK') row.whatsappClicks++
      else if (e.eventType === 'ADD_TO_CART') row.cartAdds++
    }
    const topProducts = Array.from(productMap.values())
      .sort(
        (a, b) =>
          b.views + b.clicks + b.whatsappClicks - (a.views + a.clicks + a.whatsappClicks)
      )
      .slice(0, 15)

    // Featured vs non-featured split (views/clicks carry the snapshot flag)
    let featuredViews = 0
    let normalViews = 0
    let featuredClicks = 0
    let normalClicks = 0
    for (const e of events) {
      if (e.eventType === 'PRODUCT_VIEW') {
        if (e.featured) featuredViews++
        else normalViews++
      } else if (e.eventType === 'PRODUCT_CLICK') {
        if (e.featured) featuredClicks++
        else normalClicks++
      }
    }

    const tally = (field: 'category' | 'brand'): NameCount[] => {
      const m = new Map<string, number>()
      for (const e of events) {
        if (e.eventType !== 'PRODUCT_VIEW') continue
        const v = e[field]
        if (!v) continue
        m.set(v, (m.get(v) ?? 0) + 1)
      }
      return Array.from(m.entries())
        .map(([name, c]) => ({ name, count: c }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }

    const sm = new Map<string, number>()
    for (const e of events) {
      if (e.eventType === 'SEARCH' && e.searchQuery) {
        sm.set(e.searchQuery, (sm.get(e.searchQuery) ?? 0) + 1)
      }
    }
    const searchTerms = Array.from(sm.entries())
      .map(([query, c]) => ({ query, count: c }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const fm = new Map<string, number>()
    for (const e of events) {
      if (e.eventType !== 'FILTER_APPLY' || !e.meta) continue
      for (const token of e.meta.split('|')) {
        if (!token) continue
        fm.set(token, (fm.get(token) ?? 0) + 1)
      }
    }
    const filterUsage = Array.from(fm.entries())
      .map(([name, c]) => ({ name, count: c }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const viewsBySlug = new Map<string, number>()
    for (const e of events) {
      if (e.eventType === 'PRODUCT_VIEW' && e.productSlug) {
        viewsBySlug.set(e.productSlug, (viewsBySlug.get(e.productSlug) ?? 0) + 1)
      }
    }
    const newProducts: NewProduct[] = newProductRows.map((p) => ({
      title: p.title,
      slug: p.slug,
      featured: p.featured,
      createdAt: p.createdAt.toISOString(),
      views: viewsBySlug.get(p.slug) ?? 0,
    }))

    return {
      rangeFrom: range.from,
      rangeTo: range.to,
      hourly,
      kpis: {
        visitors,
        pageViews: count('PAGE_VIEW'),
        productViews: count('PRODUCT_VIEW'),
        productClicks: count('PRODUCT_CLICK'),
        whatsappClicks: count('WHATSAPP_CLICK'),
        addToCart: count('ADD_TO_CART'),
        checkouts: count('CART_CHECKOUT'),
        searches: count('SEARCH'),
        totalPublishedProducts,
        productsWithInterest: interestKeys.size,
      },
      timeseries: Array.from(series.values()),
      topProducts,
      featuredSplit: { featuredViews, normalViews, featuredClicks, normalClicks },
      categoryBreakdown: tally('category'),
      brandBreakdown: tally('brand'),
      searchTerms,
      filterUsage,
      recentEvents: recentRows.map((e) => ({
        eventType: e.eventType,
        productTitle: e.productTitle,
        searchQuery: e.searchQuery,
        source: e.source,
        meta: e.meta,
        createdAt: e.createdAt.toISOString(),
      })),
      newProducts,
    }
  } catch (e) {
    console.error('analytics summary error:', e instanceof Error ? e.message : e)
    return emptySummary(range, hourly)
  }
}

/** Per-day views + unique visitors for the last N days — feeds calendar heat. */
export async function getDailyCounts(days = 365): Promise<DailyCount[]> {
  const today = istToday()
  const range = rangeFromDays(Math.min(days, 365), today)
  const { start } = rangeWindow(range)

  try {
    const events = await prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: start } },
      select: { eventType: true, visitorId: true, createdAt: true },
    })

    const views = new Map<string, number>()
    const visitorSets = new Map<string, Set<string>>()
    for (const e of events) {
      const day = istDay(e.createdAt)
      if (e.eventType === 'PAGE_VIEW') {
        views.set(day, (views.get(day) ?? 0) + 1)
      }
      let set = visitorSets.get(day)
      if (!set) {
        set = new Set<string>()
        visitorSets.set(day, set)
      }
      set.add(e.visitorId)
    }

    const out: DailyCount[] = []
    for (let d = range.from; d <= range.to; d = addDays(d, 1)) {
      out.push({ date: d, views: views.get(d) ?? 0, visitors: visitorSets.get(d)?.size ?? 0 })
    }
    return out
  } catch (e) {
    console.error('daily counts error:', e instanceof Error ? e.message : e)
    return []
  }
}
