import '../styles/globals.css'
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/queries'
import Header from '@/components/public/header'
import Footer from '@/components/public/footer'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  
  return {
    title: settings?.businessName || 'Hot Wheels Collector',
    description: settings?.heroSubtitle || 'Premium Hot Wheels diecast collector cars',
    keywords: ['Hot Wheels', 'die-cast', 'toy cars', 'collector', 'diecast'],
    openGraph: {
      title: settings?.businessName || 'Hot Wheels Collector',
      description: settings?.heroSubtitle || 'Premium Hot Wheels diecast collector cars',
      type: 'website',
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-hotwheels-black text-hotwheels-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}