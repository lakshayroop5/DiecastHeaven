import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ANALYTIC_EVENT_TYPES } from '@/lib/track'

export const dynamic = 'force-dynamic'

const MAX_BODY = 2000
const MAX_STR = 300

function clean(value: unknown, max = MAX_STR): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, max)
}

export async function POST(req: NextRequest) {
  let raw: string
  try {
    raw = await req.text()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }
    body = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const eventType = body.eventType
  if (
    typeof eventType !== 'string' ||
    !(ANALYTIC_EVENT_TYPES as readonly string[]).includes(eventType)
  ) {
    return NextResponse.json({ error: 'Invalid eventType' }, { status: 400 })
  }

  const existing = req.cookies.get('dh_visitor')?.value
  const visitorId = existing ?? crypto.randomUUID()

  const data = {
    eventType,
    visitorId,
    productId: clean(body.productId, 50),
    productSlug: clean(body.productSlug, 200),
    productTitle: clean(body.productTitle),
    brand: clean(body.brand),
    category: clean(body.category),
    featured: body.featured === true,
    orderType: clean(body.orderType, 50),
    source: clean(body.source),
    searchQuery: clean(body.searchQuery),
    meta: clean(body.meta, MAX_BODY),
  }

  try {
    // Dedup: one PRODUCT_VIEW per visitor per product per 24h.
    // ponytail: count-then-insert — two truly concurrent beacons for the same
    // visitor+slug can both pass and double-insert; harmless count inflation,
    // unique index on (visitorId, productSlug, istDay) if it ever matters.
    if (eventType === 'PRODUCT_VIEW' && data.productSlug) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recent = await prisma.analyticsEvent.count({
        where: {
          eventType: 'PRODUCT_VIEW',
          visitorId,
          productSlug: data.productSlug,
          createdAt: { gte: since },
        },
      })
      if (recent === 0) {
        await prisma.analyticsEvent.create({ data })
      }
    } else {
      await prisma.analyticsEvent.create({ data })
    }
  } catch (e) {
    console.error(
      `track error (${eventType}):`,
      e instanceof Error ? e.message : e
    )
  }

  const res = new NextResponse(null, { status: 204 })
  if (!existing) {
    res.cookies.set('dh_visitor', visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
  }
  return res
}
