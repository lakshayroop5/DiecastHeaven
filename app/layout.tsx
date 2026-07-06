import '../styles/globals.css'
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/queries'
import Header from '@/components/public/header'
import Footer from '@/components/public/footer'
import { CartProvider } from '@/lib/cart-context'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    title: settings?.businessName || 'Diecast Heaven',
    description:
      settings?.heroSubtitle ||
      "India's Premium Diecast Destination - Hot Wheels, Majorette, Matchbox, Bburago, Tomica",
    keywords: [
      'Hot Wheels',
      'diecast',
      'toy cars',
      'collector',
      'diecast heaven',
      'Majorette',
      'Matchbox',
      'Bburago',
      'Tomica',
    ],
    openGraph: {
      title: settings?.businessName || 'Diecast Heaven',
      description:
        settings?.heroSubtitle ||
        "India's Premium Diecast Destination",
      type: 'website',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()

  return (
    <html lang="en">
      <body className="bg-hotwheels-black text-hotwheels-white min-h-screen flex flex-col">
        <CartProvider>
          <Header businessName={settings?.businessName} />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
