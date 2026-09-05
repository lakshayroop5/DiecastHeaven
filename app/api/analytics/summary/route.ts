import { NextRequest, NextResponse } from 'next/server'
import {
  getAnalyticsSummary,
  istToday,
  rangeFromDays,
  spanDays,
  type DateRange,
} from '@/lib/analytics'

export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** ?days=N legacy pills, or ?from=&to= IST dates (custom range / single day). */
function resolveRange(params: URLSearchParams): DateRange | { error: string } {
  const from = params.get('from')
  const to = params.get('to')

  if (!from && !to) {
    const raw = Number(params.get('days'))
    const days = [7, 30, 90, 365].includes(raw) ? raw : 30
    return rangeFromDays(days)
  }

  const fail = (msg: string): { error: string } => ({ error: msg })
  if (!from || !to) return fail('from and to must be provided together')
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) return fail('from/to must be YYYY-MM-DD')
  if (from > to) return fail('from must be on or before to')

  const today = istToday()
  if (to > today) return fail('to cannot be in the future')
  if (spanDays({ from, to }) > 366) return fail('range cannot exceed 366 days')

  return { from, to }
}

export async function GET(req: NextRequest) {
  const resolved = resolveRange(req.nextUrl.searchParams)
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 400 })
  }
  const summary = await getAnalyticsSummary(resolved)
  return NextResponse.json(summary)
}
