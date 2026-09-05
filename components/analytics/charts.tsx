'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { FeaturedSplit, TimeseriesPoint, TopProduct } from '@/lib/analytics'

const TOOLTIP_STYLE = {
  backgroundColor: '#1A1A1A',
  border: '1px solid #2D2D2D',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
} as const

const AXIS_TICK = { fontSize: 11, fill: '#9CA3AF' } as const

export function TrendChart({ data, hourly = false }: { data: TimeseriesPoint[]; hourly?: boolean }) {
  // hourly points are "HH:00"; daily are "YYYY-MM-DD"
  const tick = hourly
    ? (v: string) => v
    : (v: string) => v.slice(5)
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={tick}
            stroke="#9CA3AF"
            tick={AXIS_TICK}
            minTickGap={hourly ? 12 : 24}
          />
          <YAxis stroke="#9CA3AF" tick={AXIS_TICK} allowDecimals={false} width={36} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#E60000" fill="#E60000" fillOpacity={0.12} strokeWidth={2} />
          <Area type="monotone" dataKey="productViews" name="Product Views" stroke="#FFD700" fill="#FFD700" fillOpacity={0.1} strokeWidth={2} />
          <Area type="monotone" dataKey="productClicks" name="Clicks" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.08} strokeWidth={2} />
          <Area type="monotone" dataKey="whatsappClicks" name="WhatsApp" stroke="#34D399" fill="#34D399" fillOpacity={0.08} strokeWidth={2} />
          <Area type="monotone" dataKey="addToCart" name="Cart Adds" stroke="#F472B6" fill="#F472B6" fillOpacity={0.08} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ProductsBarChart({ data }: { data: TopProduct[] }) {
  const rows = data.slice(0, 8)
  if (rows.length === 0) {
    return <p className="py-16 text-center text-sm text-gray-400">No product activity yet.</p>
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
          <XAxis
            dataKey="title"
            stroke="#9CA3AF"
            tick={AXIS_TICK}
            interval={0}
            angle={-28}
            textAnchor="end"
            height={72}
            tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 14)}…` : v)}
          />
          <YAxis stroke="#9CA3AF" tick={AXIS_TICK} allowDecimals={false} width={36} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="views" name="Views" fill="#E60000" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="whatsappClicks" name="WhatsApp" fill="#34D399" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function FeaturedPieChart({ split }: { split: FeaturedSplit }) {
  const data = [
    { name: 'Featured', value: split.featuredViews + split.featuredClicks },
    { name: 'Non-featured', value: split.normalViews + split.normalClicks },
  ]
  const total = data[0].value + data[1].value
  if (total === 0) {
    return <p className="py-16 text-center text-sm text-gray-400">No product views yet.</p>
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            stroke="#0A0A0A"
          >
            <Cell fill="#E60000" />
            <Cell fill="#FFD700" />
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
