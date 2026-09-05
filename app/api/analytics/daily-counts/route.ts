import { NextResponse } from 'next/server'
import { getDailyCounts } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

/** GET /api/analytics/daily-counts — last 365 days {date, views, visitors}. */
export async function GET() {
  const counts = await getDailyCounts(365)
  return NextResponse.json(counts)
}
