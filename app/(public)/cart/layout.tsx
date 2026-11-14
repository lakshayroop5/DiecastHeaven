import type { Metadata } from 'next'

/**
 * The cart is a client-rendered page with no standalone search value, so it is
 * excluded from the index while still being crawlable enough to pass link equity
 * through to product pages.
 */
export const metadata: Metadata = {
  title: 'Your Cart',
  robots: { index: false, follow: true },
  alternates: { canonical: '/cart' },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
