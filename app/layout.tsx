import '../styles/globals.css'
import type { Metadata } from 'next'
import { CartProvider } from '@/lib/cart-context'

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
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
