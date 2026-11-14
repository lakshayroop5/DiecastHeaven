import { getCategories } from '@/lib/queries'
import Header from '@/components/public/header'
import Footer from '@/components/public/footer'
import PageViewTracker from '@/components/analytics/page-view-tracker'

/**
 * Site-wide metadata lives in `app/layout.tsx`. This segment deliberately
 * declares none: a `title` here would be templated by the root layout and every
 * public page would inherit the same string, which is what produced the
 * duplicate "Diecast Heaven" titles across the homepage, catalog and cart.
 */

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await getCategories()
  return (
    <>
      <PageViewTracker />
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
