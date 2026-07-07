'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

// ponytail: inline SVG Hot Wheels F1 car — zero deps
function RaceCar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 28 L20 12 L40 8 L80 8 L100 12 L110 20 L110 28 Z" fill="currentColor" />
      <path d="M40 8 L50 4 L70 4 L80 8 Z" fill="currentColor" opacity="0.7" />
      <path d="M5 28 L10 24 L10 28 Z" fill="currentColor" />
      <rect x="3" y="26" width="12" height="3" rx="1" fill="currentColor" />
      <rect x="105" y="6" width="3" height="10" rx="1" fill="currentColor" />
      <rect x="102" y="4" width="10" height="3" rx="1" fill="currentColor" />
      <circle cx="28" cy="30" r="6" fill="#111" stroke="currentColor" strokeWidth="2" />
      <circle cx="28" cy="30" r="2" fill="currentColor" />
      <circle cx="92" cy="30" r="6" fill="#111" stroke="currentColor" strokeWidth="2" />
      <circle cx="92" cy="30" r="2" fill="currentColor" />
      <rect x="30" y="14" width="55" height="3" rx="1" fill="#FFD700" opacity="0.8" />
    </svg>
  )
}

const MIN_DISPLAY_MS = 800

export default function PageLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const pathAtLoadRef = useRef<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const loadedAtRef = useRef<number>(0)

  const stopProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startProgress = () => {
    stopProgress()
    let p = 0
    intervalRef.current = setInterval(() => {
      p += Math.random() * 12 + 3
      if (p > 85) p = 85
      setProgress(p)
    }, 100)
  }

  const finish = () => {
    stopProgress()
    setProgress(100)
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setLoading(false)
      loadedAtRef.current = 0
    }, 300)
  }

  // Intercept link clicks
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest('[data-noloader]')) return
      const link = (e.target as HTMLElement).closest('a')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('javascript')) return
      if (link.target === '_blank') return

      pathAtLoadRef.current = pathname
      loadedAtRef.current = Date.now()
      setProgress(0)
      setVisible(true)
      setLoading(true)
      startProgress()
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [pathname])

  // Intercept history.pushState/replaceState for browser back/forward + all navigations
  useEffect(() => {
    if (typeof window === 'undefined') return
    const origPush = window.history.pushState.bind(window.history)
    const origReplace = window.history.replaceState.bind(window.history)

    window.history.pushState = (...args) => {
      pathAtLoadRef.current = pathname
      loadedAtRef.current = Date.now()
      setProgress(0)
      setVisible(true)
      setLoading(true)
      startProgress()
      return origPush(...args)
    }
    window.history.replaceState = (...args) => {
      pathAtLoadRef.current = pathname
      loadedAtRef.current = Date.now()
      setProgress(0)
      setVisible(true)
      setLoading(true)
      startProgress()
      return origReplace(...args)
    }
    return () => {
      window.history.pushState = origPush
      window.history.replaceState = origReplace
    }
  }, [pathname])

  // Detect navigation complete via pathname change
  useEffect(() => {
    if (!loading || pathAtLoadRef.current === null) return

    if (pathname !== pathAtLoadRef.current) {
      const elapsed = Date.now() - loadedAtRef.current
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)
      if (remaining > 0) {
        timerRef.current = setTimeout(finish, remaining)
      } else {
        finish()
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname, loading])

  // Fallback: force-hide after 8s
  useEffect(() => {
    if (!loading) return
    const t = setTimeout(finish, 8000)
    return () => clearTimeout(t)
  }, [loading])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="h-[3px] bg-hotwheels-black/20 w-full">
        <div
          className="h-full bg-hotwheels-red transition-all duration-[150ms] ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div
        className="absolute top-[-14px] transition-all duration-[150ms] ease-out z-[10000]"
        style={{ left: `calc(${Math.min(progress, 93)}% - 16px)` }}
      >
        <RaceCar className="w-10 h-5 text-hotwheels-red drop-shadow-lg" />
      </div>
      {progress > 10 && (
        <div
          className="absolute top-[1px] h-[3px] opacity-30"
          style={{
            left: 0,
            width: `${Math.min(progress - 10, 80)}%`,
            background: 'linear-gradient(90deg, transparent 0%, #ff3333 40%, transparent 100%)',
            animation: 'exhaust-pulse 0.3s infinite alternate',
          }}
        />
      )}
    </div>
  )
}
