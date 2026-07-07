import '../styles/globals.css'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CartProvider } from '@/lib/cart-context'
import PageLoader from '@/components/page-loader'

export const metadata: Metadata = {
  title: process.env.DEFAULT_BUSINESS_NAME || 'Diecast Heaven',
  description: process.env.DEFAULT_HERO_SUBTITLE || "India's Premium Diecast Destination",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-hotwheels-black text-hotwheels-white min-h-screen flex flex-col">
        <Suspense fallback={null}>
          <PageLoader />
        </Suspense>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
