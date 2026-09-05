'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { track } from '@/lib/track'

/**
 * Fires PAGE_VIEW once per public route change.
 * Mounted in app/(public)/layout.tsx — covers home, catalog, product, about, cart.
 */
export default function PageViewTracker() {
  const pathname = usePathname()
  const last = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || last.current === pathname) return
    last.current = pathname
    track({ eventType: 'PAGE_VIEW', source: pathname })
  }, [pathname])

  return null
}
