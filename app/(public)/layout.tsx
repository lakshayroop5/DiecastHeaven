import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/queries'
import Header from '@/components/public/header'
import Footer from '@/components/public/footer'
import PageViewTracker from '@/components/analytics/page-view-tracker'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: settings?.businessName || process.env.DEFAULT_BUSINESS_NAME || 'Diecast Heaven Udaipur',
    description: settings?.heroSubtitle || process.env.DEFAULT_HERO_SUBTITLE || "India's Premium Diecast Destination",
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()
  return (
    <>
      <PageViewTracker />
      <Header whatsappNumber={settings?.whatsappNumber} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
