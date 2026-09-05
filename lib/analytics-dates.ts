/** Pure IST date helpers — safe for client and server (no prisma import). */

/** IST calendar date (YYYY-MM-DD) for a moment. India has no DST, so the
 * fixed +5:30 shift is correct year-round; toISOString is UTC, so shifting
 * first yields the IST date. */
export function istDay(d: Date): string {
  return new Date(d.getTime() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function istToday(): string {
  return istDay(new Date())
}

/** Add n days to a YYYY-MM-DD string (noon-UTC anchor avoids boundary bugs). */
export function addDays(dateStr: string, n: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** IST date range, inclusive on both ends. */
export interface DateRange {
  from: string
  to: string
}

export function rangeFromDays(days: number, today = istToday()): DateRange {
  return { from: addDays(today, -(days - 1)), to: today }
}

export function spanDays(range: DateRange): number {
  return Math.round(
    (Date.parse(`${range.to}T12:00:00Z`) - Date.parse(`${range.from}T12:00:00Z`)) / 86_400_000
  ) + 1
}
