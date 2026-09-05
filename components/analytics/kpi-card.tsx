import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: number | string
  icon: ReactNode
  accent?: string
}

export default function KpiCard({ label, value, icon, accent = 'text-hotwheels-yellow' }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-hotwheels-gray bg-hotwheels-gray/50 p-4 transition-colors hover:border-hotwheels-red/40">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <span className={accent}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-white">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
    </div>
  )
}
