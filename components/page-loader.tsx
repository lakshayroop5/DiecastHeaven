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
  const searchStr = searchParams.toString()
  const routeKey = pathname + (searchStr ? '?' + searchStr : '')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const pathAtLoadRef = useRef<string | null>(null)
  
  const showTimerRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
    stopProgress()
    setProgress(100)

    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
    fadeTimeoutRef.current = setTimeout(() => {
      setVisible(false)
      setLoading(false)
    }, 150)
  }

  const handleStart = () => {
    setLoading(true)
    pathAtLoadRef.current = window.location.pathname + window.location.search

    if (showTimerRef.current) clearTimeout(showTimerRef.current)
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)

    showTimerRef.current = setTimeout(() => {
      setVisible(true)
      setProgress(0)
      startProgress()
    }, 150)
  }

  // Intercept fetch API for RSC navigations
  useEffect(() => {
    if (typeof window === 'undefined') return

    const originalFetch = window.fetch

    window.fetch = async function (input, init) {
      let headers: Record<string, string> = {}
      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((value, key) => {
            headers[key.toLowerCase()] = value
          })
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, value]) => {
            headers[key.toLowerCase()] = value
          })
        } else {
          Object.entries(init.headers).forEach(([key, value]) => {
            headers[key.toLowerCase()] = String(value)
          })
        }
      }

      const urlStr = typeof input === 'string'
        ? input
        : input instanceof URL
        ? input.href
        : input && typeof input === 'object' && 'url' in input
        ? (input as any).url
        : ''

      const isRsc = headers['rsc'] === '1' || urlStr.includes('_rsc=')
      const isPrefetch = headers['next-router-prefetch'] === '1' || headers['purpose'] === 'prefetch'
      const isNav = isRsc && !isPrefetch

      if (isNav) {
        window.dispatchEvent(new Event('nextjs-navigation-start'))
      }

      try {
        const response = await originalFetch(input, init)
        return response
      } finally {
        if (isNav) {
          window.dispatchEvent(new Event('nextjs-navigation-end'))
        }
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  // Listen to navigation events
  useEffect(() => {
    const onStart = () => handleStart()
    const onEnd = () => {
      // ponytail: Wait 300ms to let the Next.js router commit the transition and update the URL on slower network environments (like Vercel).
      // ponytail: If the URL changes, the routeKey effect handles the dismissal instantly.
      // ponytail: If the URL does not change, this cleans up and closes the loader after the delay.
      setTimeout(() => {
        finish()
      }, 300)
    }

    window.addEventListener('nextjs-navigation-start', onStart)
    window.addEventListener('nextjs-navigation-end', onEnd)

    return () => {
      window.removeEventListener('nextjs-navigation-start', onStart)
      window.removeEventListener('nextjs-navigation-end', onEnd)
    }
  }, [])

  // Intercept link clicks
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest('[data-noloader]')) return
      const link = (e.target as HTMLElement).closest('a')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href) return

      // Skip non-navigation protocols
      if (
        href.startsWith('#') ||
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) return

      if (link.target === '_blank') return

      try {
        const targetUrl = new URL(href, window.location.href)
        
        // Skip external links
        if (targetUrl.origin !== window.location.origin) return

        // Skip if same pathname and search params (hash changes / anchor links)
        if (
          targetUrl.pathname === window.location.pathname &&
          targetUrl.search === window.location.search
        ) return

        handleStart()
      } catch (err) {
        // Safe fallback
      }
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [])

  // Detect navigation complete via route key change (fallback)
  useEffect(() => {
    if (!loading || pathAtLoadRef.current === null) return

    if (routeKey !== pathAtLoadRef.current) {
      finish()
    }
  }, [routeKey, loading])

  // 10s safety fallback to prevent stuck loader
  useEffect(() => {
    if (!loading) return
    const t = setTimeout(finish, 10000)
    return () => clearTimeout(t)
  }, [loading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
    }
  }, [])

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
