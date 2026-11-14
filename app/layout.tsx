import '../styles/globals.css'
import { Suspense } from 'react'
import type { Metadata, Viewport } from 'next'
import { CartProvider } from '@/lib/cart-context'
import PageLoader from '@/components/page-loader'
import JsonLd from '@/components/seo/json-ld'
import { siteGraphSchema } from '@/lib/seo/schema'
import { SITE_LOCALE, SITE_NAME, SITE_URL, defaultOgImage } from '@/lib/seo/site'

const DEFAULT_TITLE = process.env.DEFAULT_BUSINESS_NAME || SITE_NAME
const DEFAULT_DESCRIPTION =
  process.env.DEFAULT_HERO_SUBTITLE || "India's Premium Diecast Destination"

export const metadata: Metadata = {
  // Required for every relative URL Next resolves in metadata (canonicals, OG images).
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${DEFAULT_TITLE} | Premium Diecast Collector Cars in India`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  category: 'shopping',
  // NOTE: no `alternates.canonical` here on purpose. Metadata in a layout is
  // inherited by every child segment, so a canonical of '/' at the root would
  // make any page that forgets its own canonical declare the homepage as the
  // preferred version of itself. Each route sets its own canonical.
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    title: `${DEFAULT_TITLE} | Premium Diecast Collector Cars in India`,
    description: DEFAULT_DESCRIPTION,
    images: [defaultOgImage()],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${DEFAULT_TITLE} | Premium Diecast Collector Cars in India`,
    description: DEFAULT_DESCRIPTION,
    images: [defaultOgImage().url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/diecast-heaven-logo.png',
  },
  formatDetection: { telephone: true, address: false, email: false },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-IN">
      <body className="bg-hotwheels-black text-hotwheels-white min-h-screen flex flex-col">
        <JsonLd data={siteGraphSchema()} />
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
