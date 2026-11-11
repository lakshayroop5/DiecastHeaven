import '../styles/globals.css'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CartProvider } from '@/lib/cart-context'
import PageLoader from '@/components/page-loader'
import GA from '@/components/analytics/ga'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.diecastheavenudaipur.in'
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Diecast Heaven Udaipur',
    template: '%s | Diecast Heaven Udaipur',
  },
  description: process.env.DEFAULT_HERO_SUBTITLE || "India's Premium Diecast Destination",
  openGraph: {
    type: 'website',
    siteName: 'Diecast Heaven Udaipur',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/diecast-heaven-logo.png',
  },
  robots: { index: true, follow: true },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-hotwheels-black text-hotwheels-white min-h-screen flex flex-col">
        <GA id={process.env.GA_MEASUREMENT_ID} />
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
