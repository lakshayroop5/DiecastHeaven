'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  ExternalLink,
  Eye,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  MousePointerClick,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import type { AnalyticsSummary, DailyCount } from '@/lib/analytics'
import { rangeFromDays, type DateRange } from '@/lib/analytics-dates'
import KpiCard from '@/components/analytics/kpi-card'
import CalendarPicker from '@/components/analytics/calendar-picker'
import { FeaturedPieChart, ProductsBarChart, TrendChart } from '@/components/analytics/charts'
import {
  BarList,
  NewProductsList,
  RecentEventsFeed,
  TopProductsTable,
} from '@/components/analytics/tables'

const RANGES = [
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
  { days: 365, label: '1 year' },
] as const

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

function prettyDate(dateStr: string): string {
  const d = Number(dateStr.slice(8, 10))
  const m = MONTHS_SHORT[Number(dateStr.slice(5, 7)) - 1]
  const y = dateStr.slice(0, 4)
  return `${d} ${m} ${y}`
}

function formatRange(from: string, to: string): string {
  return from === to ? prettyDate(from) : `${prettyDate(from)} → ${prettyDate(to)}`
}

type Selection = { kind: 'preset'; days: number } | { kind: 'custom'; range: DateRange }

function Section({
  title,
  children,
  className = '',
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-lg border border-hotwheels-gray bg-hotwheels-gray/50 p-4 sm:p-6 ${className}`}>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-hotwheels-white">{title}</h2>
      {children}
    </section>
  )
}

function ChartSkeleton() {
  return <div className="h-72 w-full animate-pulse rounded-lg bg-hotwheels-black/60" />
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [selection, setSelection] = useState<Selection>({ kind: 'preset', days: 30 })
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [dailyCounts, setDailyCounts] = useState<DailyCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const loadCounts = useCallback(async () => {
    try {
      const countsRes = await fetch('/api/analytics/daily-counts', { cache: 'no-store' })
      if (countsRes.ok) setDailyCounts(await countsRes.json())
    } catch {
      // calendar heat stays stale/empty on failure — summary is the primary data
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const query =
      selection.kind === 'preset'
        ? `days=${selection.days}`
        : `from=${selection.range.from}&to=${selection.range.to}`
    try {
      const summaryRes = await fetch(`/api/analytics/summary?${query}`, { cache: 'no-store' })
      if (summaryRes.status === 401) {
        router.replace('/analytics/login')
        return
      }
      if (!summaryRes.ok) throw new Error(`Request failed (${summaryRes.status})`)
      setData(await summaryRes.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [selection, router])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void loadCounts()
  }, [loadCounts])

  const handleLogout = async () => {
    await fetch('/api/analytics/logout', { method: 'POST' })
    router.replace('/analytics/login')
  }

  const effectiveRange = useMemo<DateRange>(
    () =>
      selection.kind === 'preset'
        ? rangeFromDays(selection.days)
        : selection.range,
    [selection]
  )

  const custom = selection.kind === 'custom' ? selection : null
  const k = data?.kpis

  return (
    <div className="min-h-screen bg-hotwheels-black">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-hotwheels-gray bg-hotwheels-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
          <div className="mr-auto flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-hotwheels-red" />
            <h1 className="text-lg font-bold text-hotwheels-white">Analytics</h1>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-hotwheels-gray bg-hotwheels-gray/50 p-1">
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setSelection({ kind: 'preset', days: r.days })}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  selection.kind === 'preset' && selection.days === r.days
                    ? 'bg-hotwheels-red text-white'
                    : 'text-gray-300 hover:bg-hotwheels-black hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {custom && (
            <button
              onClick={() => setSelection({ kind: 'preset', days: 30 })}
              title="Back to 30d preset"
              className="flex items-center gap-1 rounded-full border border-hotwheels-yellow/60 bg-hotwheels-yellow/10 px-3 py-1 text-xs font-semibold text-hotwheels-yellow transition-colors hover:bg-hotwheels-yellow/20"
            >
              {formatRange(custom.range.from, custom.range.to)}
              <X className="h-3 w-3" />
            </button>
          )}

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-hotwheels-gray hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">View site</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-hotwheels-gray hover:text-white"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-hotwheels-gray hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {data && (
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <CalendarDays className="h-3.5 w-3.5 text-hotwheels-red" />
            Showing <span className="font-semibold text-hotwheels-white">{formatRange(data.rangeFrom, data.rangeTo)}</span>
            {data.hourly ? ' · hourly breakdown' : ` · ${data.timeseries.length} days`}
            <button
              onClick={() => { void load(); void loadCounts() }}
              disabled={loading}
              className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-hotwheels-gray hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </p>
        )}

        {error && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-hotwheels-red/50 bg-hotwheels-red/10 px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => void load()}
              className="flex items-center gap-1.5 rounded-md bg-hotwheels-red px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* KPI cards */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {k ? (
            <>
              <KpiCard label="Visitors" value={k.visitors} icon={<Users className="h-4 w-4" />} />
              <KpiCard label="Page Views" value={k.pageViews} icon={<Eye className="h-4 w-4" />} />
              <KpiCard label="Product Views" value={k.productViews} icon={<Package className="h-4 w-4" />} />
              <KpiCard label="Product Clicks" value={k.productClicks} icon={<MousePointerClick className="h-4 w-4" />} />
              <KpiCard label="WhatsApp Clicks" value={k.whatsappClicks} icon={<MessageCircle className="h-4 w-4" />} accent="text-green-400" />
              <KpiCard label="Cart Adds" value={k.addToCart} icon={<ShoppingCart className="h-4 w-4" />} accent="text-pink-400" />
              <KpiCard label="Checkouts" value={k.checkouts} icon={<ClipboardCheck className="h-4 w-4" />} accent="text-red-400" />
              <KpiCard label="Searches" value={k.searches} icon={<Search className="h-4 w-4" />} accent="text-blue-400" />
              <KpiCard
                label="Products Viewed"
                value={`${k.productsWithInterest} of ${k.totalPublishedProducts}`}
                icon={<TrendingUp className="h-4 w-4" />}
              />
            </>
          ) : (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-[86px] animate-pulse rounded-lg border border-hotwheels-gray bg-hotwheels-gray/50" />
            ))
          )}
        </section>

        {/* Calendar + trend */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Section title="Per-day calendar" className="lg:col-span-1">
            <CalendarPicker counts={dailyCounts} range={effectiveRange} onSelect={(range) => setSelection({ kind: 'custom', range })} />
          </Section>
          <Section title={data?.hourly ? 'Activity by hour (IST)' : 'Activity over time'} className="lg:col-span-2">
            {mounted && data ? <TrendChart data={data.timeseries} hourly={data.hourly} /> : <ChartSkeleton />}
          </Section>
        </div>

        {/* Products + featured split */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Section title="Top products — views vs WhatsApp" className="lg:col-span-2">
            {mounted && data ? <ProductsBarChart data={data.topProducts} /> : <ChartSkeleton />}
          </Section>
          <Section title="Featured vs regular interest">
            {mounted && data ? <FeaturedPieChart split={data.featuredSplit} /> : <ChartSkeleton />}
          </Section>
        </div>

        {/* Breakdowns */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Section title="Category interest">
            {data ? <BarList items={data.categoryBreakdown} /> : <ChartSkeleton />}
          </Section>
          <Section title="Brand interest">
            {data ? <BarList items={data.brandBreakdown} /> : <ChartSkeleton />}
          </Section>
          <Section title="Top searches">
            {data ? <BarList items={data.searchTerms.map((s) => ({ name: s.query, count: s.count }))} /> : <ChartSkeleton />}
          </Section>
        </div>

        {/* Product detail table */}
        <Section title="Product interest detail">
          {data ? <TopProductsTable items={data.topProducts} /> : <ChartSkeleton />}
        </Section>

        {/* Newest + recent activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Newest products">
            {data ? <NewProductsList items={data.newProducts} /> : <ChartSkeleton />}
          </Section>
          <Section title="Recent activity">
            {data ? <RecentEventsFeed items={data.recentEvents} /> : <ChartSkeleton />}
          </Section>
        </div>

        <p className="pb-4 text-center text-xs text-gray-600">
          First-party analytics · no third-party trackers · data starts accumulating from deploy
        </p>
      </main>
    </div>
  )
}
