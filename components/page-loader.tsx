'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// ponytail: inline F1 car SVG with animated wheels + exhaust
function RaceCar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* exhaust flame */}
      <g className="origin-[0_20px]" style={{ animation: 'flame-flicker 0.15s infinite alternate' }}>
        <ellipse cx="-6" cy="22" rx="6" ry="3" fill="#FF4500" opacity="0.8" />
        <ellipse cx="-9" cy="22" rx="4" ry="2" fill="#FFD700" opacity="0.6" />
      </g>
      {/* body */}
      <path d="M10 28 L20 12 L40 8 L80 8 L100 12 L110 20 L110 28 Z" fill="#E3292E" />
      {/* nose */}
      <path d="M8 26 L12 22 L12 28 Z" fill="#E3292E" />
      <rect x="2" y="25" width="14" height="3" rx="1.5" fill="#E3292E" />
      {/* rear wing */}
      <rect x="105" y="5" width="3" height="11" rx="1" fill="#E3292E" />
      <rect x="100" y="3" width="12" height="3" rx="1.5" fill="#E3292E" />
      {/* cockpit */}
      <path d="M40 8 L50 3 L70 3 L80 8 Z" fill="#222" />
      {/* yellow accent stripe */}
      <rect x="28" y="14" width="56" height="3" rx="1.5" fill="#FFD700" />
      {/* front wheel */}
      <g style={{ animation: 'wheel-spin 0.6s linear infinite', transformOrigin: '25px 30px' }}>
        <circle cx="25" cy="30" r="7" fill="#1A1A1A" stroke="#fff" strokeWidth="1.5" />
        <line x1="25" y1="23" x2="25" y2="37" stroke="#fff" strokeWidth="1" />
        <line x1="18" y1="30" x2="32" y2="30" stroke="#fff" strokeWidth="1" />
        <circle cx="25" cy="30" r="2.5" fill="#E3292E" />
      </g>
      {/* rear wheel */}
      <g style={{ animation: 'wheel-spin 0.6s linear infinite', transformOrigin: '93px 30px' }}>
        <circle cx="93" cy="30" r="7" fill="#1A1A1A" stroke="#fff" strokeWidth="1.5" />
        <line x1="93" y1="23" x2="93" y2="37" stroke="#fff" strokeWidth="1" />
        <line x1="86" y1="30" x2="100" y2="30" stroke="#fff" strokeWidth="1" />
        <circle cx="93" cy="30" r="2.5" fill="#E3292E" />
      </g>
      {/* Halo */}
      <path d="M45 8 C55 -2 65 -2 75 8" stroke="#fff" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

// ponytail: hides immediately on route key change — tracks pathname + searchParams for query-only navs
export default function PageLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const routeKey = pathname + '?' + searchParams.toString()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const pathAtLoadRef = useRef<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
    setVisible(false)
    setLoading(false)
  }

  // Intercept link clicks
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest('[data-noloader]')) return
      const link = (e.target as HTMLElement).closest('a')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('javascript') || href.startsWith('mailto') || href.startsWith('tel')) return
      if (link.target === '_blank') return
      // skip if same full URL
      if (href === window.location.pathname + window.location.search) return
      pathAtLoadRef.current = window.location.pathname + window.location.search
      setProgress(0)
      setVisible(true)
      setLoading(true)
      startProgress()
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [pathname])

  // Intercept history API for back/forward
  useEffect(() => {
    if (typeof window === 'undefined') return
    const origPush = window.history.pushState.bind(window.history)
    const origReplace = window.history.replaceState.bind(window.history)

    const intercept = () => {
      pathAtLoadRef.current = window.location.pathname + window.location.search
      setProgress(0)
      setVisible(true)
      setLoading(true)
      startProgress()
    }

    window.history.pushState = (...args) => { intercept(); return origPush(...args) }
    window.history.replaceState = (...args) => { intercept(); return origReplace(...args) }

    return () => {
      window.history.pushState = origPush
      window.history.replaceState = origReplace
    }
  }, [pathname])

  // Detect navigation complete via route key change (pathname + searchParams)
  useEffect(() => {
    if (!loading || pathAtLoadRef.current === null) return

    if (routeKey !== pathAtLoadRef.current) {
      finish()
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [routeKey, loading])

  // 8s fallback
  useEffect(() => {
    if (!loading) return
    const t = setTimeout(finish, 8000)
    return () => clearTimeout(t)
  }, [loading])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* card */}
      <div className="relative flex flex-col items-center gap-5 px-10 py-8 rounded-2xl bg-[#1a1a1a] border border-hotwheels-red/40 shadow-[0_0_40px_rgba(227,41,46,0.15)]">
        {/* car */}
        <div className="relative z-10" style={{ animation: 'car-bounce 0.4s ease-in-out infinite alternate' }}>
          <RaceCar className="w-28 h-12 drop-shadow-[0_0_12px_rgba(227,41,46,0.5)]" />
        </div>

        {/* brand */}
        <p className="relative z-10 text-sm font-bold tracking-widest text-hotwheels-red uppercase">
          Diecast Heaven
        </p>
        <p className="relative z-10 text-[10px] tracking-[0.15em] text-gray-500 -mt-4 uppercase">
          Udaipur
        </p>

        {/* progress bar */}
        <div className="relative z-10 w-48 h-1 rounded-full bg-hotwheels-black/80 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-hotwheels-red to-hotwheels-yellow transition-all duration-[150ms] ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* loading text */}
        <p className="relative z-10 text-[11px] tracking-[0.2em] text-gray-400 uppercase -mt-2">
          Loading
          <span className="ml-1" style={{ animation: 'dots 1.4s steps(4) infinite' }}>...</span>
        </p>
      </div>
    </div>
  )
}
