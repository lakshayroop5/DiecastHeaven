import { Suspense } from 'react'
import Link from 'next/link'
import Hero from '@/components/public/hero'
import FeaturedProducts from '@/components/public/featured-products'
import WhatsAppCTA from '@/components/public/whatsapp-cta'
import Reveal from '@/components/public/reveal'
import { getBrands, getSiteSettings, getHeroMedia } from '@/lib/queries'

export const dynamic = 'force-dynamic'

const STEPS = [
  { n: '01', title: 'BROWSE THE GRID', text: 'Filter 500+ liveries by brand, scale, or price.' },
  { n: '02', title: 'LOCK YOUR LIVERY', text: 'Reserve on WhatsApp — deposit now, balance on delivery.' },
  { n: '03', title: 'GREEN LIGHT DELIVERY', text: 'Pan-India shipping with collector-grade packing.' },
]

const HUD = [
  { icon: '\u{1F3CE}\uFE0F', tag: 'PIT WALL // 01', title: 'GENUINE PRODUCTS', text: 'Brand-new, authentic diecast sourced directly from brands.' },
  { icon: '\u26A1', tag: 'PIT WALL // 02', title: 'COLLECTOR QUALITY', text: 'Carefully preserved for serious collectors.' },
  { icon: '\u{1F4AC}', tag: 'PIT WALL // 03', title: 'FAST REPLIES', text: 'WhatsApp us for instant responses on stock + shipping.' },
]

function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-hotwheels-gray rounded-lg overflow-hidden border border-hotwheels-black">
          <div className="aspect-square bg-hotwheels-black animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-hotwheels-black rounded w-1/3 animate-pulse" />
            <div className="h-5 bg-hotwheels-black rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-hotwheels-black rounded w-1/4 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function HomePage() {
  const [brands, settings, heroMedia] = await Promise.all([
    getBrands(),
    getSiteSettings(),
    getHeroMedia(),
  ])

  return (
    <>
      {/* Hero */}
      <Hero
        title={settings?.heroTitle || process.env.DEFAULT_HERO_TITLE || "India's Premium Diecast Destination"}
        subtitle={
          settings?.heroSubtitle ||
          process.env.DEFAULT_HERO_SUBTITLE ||
          'Hot Wheels \u00b7 Majorette \u00b7 Matchbox \u00b7 Bburago \u00b7 Tomica'
        }
        media={heroMedia}
      />

      {/* Pole Position */}
      <section className="py-16 sm:py-20 bg-hotwheels-black">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-black italic uppercase tracking-[0.25em] text-apex-redline mb-2">Pole Position</p>
              <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-hotwheels-white">
                Featured Models
              </h2>
            </div>
            <Link
              href="/catalog"
              className="shrink-0 text-sm font-bold italic uppercase tracking-wider text-hotwheels-red hover:text-hotwheels-yellow transition-colors"
            >
              View All &rarr;
            </Link>
          </div>
          </Reveal>

          <Reveal delay={60}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
            {STEPS.map((s) => (
              <div key={s.n} className="relative overflow-hidden rounded-xl border border-white/10 bg-hotwheels-gray/60 px-5 py-4">
                <span aria-hidden="true" className="race-ghost pointer-events-none absolute -top-2 right-2 text-6xl font-black italic">
                  {s.n}
                </span>
                <p className="text-[10px] font-black italic uppercase tracking-[0.25em] text-apex-redline">{s.n} // GRID SLOT</p>
                <h3 className="mt-1 text-sm font-black italic uppercase tracking-tight text-white">{s.title}</h3>
                <p className="mt-1 text-xs text-gray-400 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
          </Reveal>

          <div className="race-chequer h-2 w-full rounded-sm opacity-80 mb-10" aria-hidden="true" />

          <Reveal delay={100}>
          <Suspense fallback={<FeaturedSkeleton />}>
            <FeaturedProducts />
          </Suspense>
          </Reveal>
        </div>
      </section>

      {/* Manufacturers League */}
      <section className="race-asphalt py-16 sm:py-20 bg-hotwheels-black border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-black italic uppercase tracking-[0.25em] text-[#D4A843] mb-2">Manufacturers League</p>
              <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-hotwheels-white">
                Shop by Brand
              </h2>
            </div>
            <Link
              href="/catalog?view=brands"
              className="shrink-0 text-sm font-bold italic uppercase tracking-wider text-hotwheels-red hover:text-hotwheels-yellow transition-colors"
            >
              View All &rarr;
            </Link>
          </div>
          </Reveal>
          <Reveal delay={100}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/catalog?brand=${brand.slug}`}
                className="race-tilt group rounded-xl border border-white/10 bg-hotwheels-gray/60 p-4 sm:p-5 text-center backdrop-blur-sm hover:border-[#D4A843]/60 hover:shadow-[0_12px_30px_-10px_rgba(212,168,67,0.35)]"
              >
                <h3 className="font-black italic uppercase tracking-tight text-sm text-hotwheels-white group-hover:text-hotwheels-yellow transition-colors">
                  {brand.name}
                </h3>
              </Link>
            ))}
          </div>
          </Reveal>
        </div>
      </section>

      {/* Pit Crew Guarantees */}
      <section className="py-16 sm:py-20 bg-hotwheels-gray border-y border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <Reveal>
          <p className="text-xs font-black italic uppercase tracking-[0.25em] text-apex-redline mb-2">Pit Crew // Guarantees</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center">
            {HUD.map((h) => (
              <div key={h.tag} className="relative overflow-hidden rounded-xl border border-white/10 bg-hotwheels-black/40 px-6 py-8 backdrop-blur-sm">
                <div className="mx-auto mb-3 flex items-center justify-center gap-1.5" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="animate-lights h-1.5 w-1.5 rounded-full" style={{ animationDelay: `${i * 0.3}s` }} />
                  ))}
                </div>
                <div className="text-4xl mb-4">{h.icon}</div>
                <p className="text-[10px] font-black italic uppercase tracking-[0.25em] text-apex-redline">{h.tag}</p>
                <h3 className="mt-1 text-xl font-black italic uppercase tracking-tight text-hotwheels-white mb-2">{h.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{h.text}</p>
              </div>
            ))}
          </div>
          </Reveal>
        </div>
      </section>

      {/* Green Light CTA */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-br from-hotwheels-red via-[#b91c1c] to-[#7f1d1d] grain">
        <div className="absolute inset-0 race-asphalt opacity-40 pointer-events-none" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Reveal>
          <div className="mx-auto mb-4 flex items-center justify-center gap-2" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="animate-lights h-3 w-3 rounded-full border border-white/30" style={{ animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>
          <p className="text-xs font-black italic uppercase tracking-[0.25em] text-white/70 mb-3">Lights Out // Walk in or WhatsApp</p>
          <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-white mb-4">
            Ready to Find Your Next Gem?
          </h2>
          <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto">
            Browse our complete collection or message us directly to find a specific model.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/catalog"
              className="btn-shine -skew-x-6 rounded-lg bg-white px-6 py-3 text-sm font-black italic uppercase tracking-wider text-hotwheels-red shadow-xl hover:bg-gray-100 active:scale-[0.98] transition-all"
            >
              <span className="inline-block skew-x-6">Browse Catalog</span>
            </Link>
            <WhatsAppCTA variant="secondary" />
          </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
