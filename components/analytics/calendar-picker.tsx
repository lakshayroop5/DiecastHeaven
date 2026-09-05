'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, istToday, type DateRange } from '@/lib/analytics-dates'
import type { DailyCount } from '@/lib/analytics'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7)
}

function monthLabel(key: string): string {
  const y = Number(key.slice(0, 4))
  const m = Number(key.slice(5, 7))
  return `${MONTH_NAMES[m - 1]} ${y}`
}

function daysInMonth(key: string): number {
  const y = Number(key.slice(0, 4))
  const m = Number(key.slice(5, 7))
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

function firstWeekdayOffset(key: string): number {
  const y = Number(key.slice(0, 4))
  const m = Number(key.slice(5, 7))
  return (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7
}

function prettyDate(dateStr: string): string {
  const m = Number(dateStr.slice(5, 7))
  const d = Number(dateStr.slice(8, 10))
  return `${d} ${MONTH_NAMES[m - 1].slice(0, 3)}`
}

interface CalendarPickerProps {
  counts: DailyCount[]
  range: DateRange | null
  onSelect: (range: DateRange) => void
}

export default function CalendarPicker({ counts, range, onSelect }: CalendarPickerProps) {
  const today = istToday()
  const [cursor, setCursor] = useState(() => monthKey(range?.to ?? today))
  const [pending, setPending] = useState<string | null>(null)

  useEffect(() => {
    if (range) setCursor(monthKey(range.to))
  }, [range])

  const byDay = useMemo(() => {
    const m = new Map<string, DailyCount>()
    for (const c of counts) m.set(c.date, c)
    return m
  }, [counts])

  const maxViews = useMemo(
    () => counts.reduce((max, c) => Math.max(max, c.views), 0),
    [counts]
  )

  const cells = useMemo(() => {
    const offset = firstWeekdayOffset(cursor)
    const total = daysInMonth(cursor)
    const out: (string | null)[] = Array.from({ length: offset }, () => null)
    for (let d = 1; d <= total; d++) {
      out.push(`${cursor}-${String(d).padStart(2, '0')}`)
    }
    return out
  }, [cursor])

  const prevMonth = () => setCursor(monthKey(addDays(`${cursor}-01`, -1)))
  const nextMonth = () => setCursor(monthKey(addDays(`${cursor}-${String(daysInMonth(cursor)).padStart(2, '0')}`, 1)))

  const cursorIsCurrent = cursor === monthKey(today)
  const cursorIsOldest = counts.length > 0 && cursor <= monthKey(counts[0].date)

  function heatClass(dateStr: string): string {
    const views = byDay.get(dateStr)?.views ?? 0
    if (views === 0) return 'bg-hotwheels-gray/30 text-gray-500'
    const ratio = views / Math.max(maxViews, 1)
    if (ratio > 0.75) return 'bg-hotwheels-red text-white'
    if (ratio > 0.5) return 'bg-hotwheels-red/70 text-white'
    if (ratio > 0.25) return 'bg-hotwheels-red/45 text-hotwheels-white'
    return 'bg-hotwheels-red/25 text-gray-200'
  }

  function isSelected(dateStr: string): boolean {
    return Boolean(range && dateStr >= range.from && dateStr <= range.to)
  }

  function handleDayClick(dateStr: string) {
    if (dateStr > today) return
    if (pending && pending !== dateStr) {
      const from = pending < dateStr ? pending : dateStr
      const to = pending < dateStr ? dateStr : pending
      setPending(null)
      onSelect({ from, to })
    } else {
      onSelect({ from: dateStr, to: dateStr })
      setPending(dateStr)
    }
  }

  return (
    <div className="rounded-lg border border-hotwheels-gray bg-hotwheels-gray/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={prevMonth}
          disabled={cursorIsOldest}
          aria-label="Previous month"
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-hotwheels-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-hotwheels-white">{monthLabel(cursor)}</p>
          <p className="text-[10px] text-gray-500">
            {pending
              ? `picked ${prettyDate(pending)} — click another day for a range`
              : 'click a day for its detail · two days for a range'}
          </p>
        </div>
        <button
          onClick={nextMonth}
          disabled={cursorIsCurrent}
          aria-label="Next month"
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-hotwheels-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="text-[10px] font-semibold uppercase text-gray-500">{w}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((dateStr, i) => {
          if (!dateStr) return <span key={`blank-${i}`} />
          const future = dateStr > today
          const day = Number(dateStr.slice(8, 10))
          const c = byDay.get(dateStr)
          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              disabled={future}
              title={future ? undefined : `${prettyDate(dateStr)} — ${c?.views ?? 0} views · ${c?.visitors ?? 0} visitors`}
              className={`relative aspect-square rounded text-xs font-semibold transition-all ${heatClass(dateStr)} ${
                future ? 'cursor-not-allowed opacity-15' : 'hover:scale-110 hover:z-10'
              } ${
                isSelected(dateStr)
                  ? 'ring-2 ring-hotwheels-yellow'
                  : ''
              } ${dateStr === today ? 'outline outline-1 outline-hotwheels-white/60' : ''}`}
            >
              {day}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-gray-500">
        <span>less</span>
        <span className="h-2.5 w-2.5 rounded bg-hotwheels-gray/30" />
        <span className="h-2.5 w-2.5 rounded bg-hotwheels-red/25" />
        <span className="h-2.5 w-2.5 rounded bg-hotwheels-red/45" />
        <span className="h-2.5 w-2.5 rounded bg-hotwheels-red/70" />
        <span className="h-2.5 w-2.5 rounded bg-hotwheels-red" />
        <span>more</span>
      </div>
    </div>
  )
}
