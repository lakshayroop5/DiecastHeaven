import Image from 'next/image'
import Link from 'next/link'
import WhatsAppCTA from './whatsapp-cta'

interface HeroProps {
  title: string
  subtitle: string
  ctaText?: string
  ctaLink?: string
  backgroundImage?: string
}

const TICKER_ITEMS = [
  'Featured Collections',
  'Limited Editions',
  "Collector's Choice",
  'Fast Shipping Across India',
]

export default function Hero({
  title,
  subtitle,
  ctaText = 'Shop Collection',
  ctaLink = '/catalog',
  backgroundImage = '/hero-banner.jpeg',
}: HeroProps) {
  return (
    <div className="relative w-full min-h-[60vh] sm:min-h-[70vh] lg:min-h-[90vh] flex flex-col">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={backgroundImage}
          alt="Diecast car showcase"
          fill
          sizes="100vw"
          className="object-[center_30%] sm:object-center"
          priority
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-2xl py-12 sm:py-16 lg:py-20">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
            {title}
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-300">
            {subtitle}
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href={ctaLink}
              className="rounded-md bg-white text-black px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              {ctaText}
            </Link>
            <Link
              href="/catalog?sort=newest"
              className="rounded-md border border-white/40 text-white px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              New Arrivals
            </Link>
            <WhatsAppCTA variant="hero" />
          </div>
        </div>
      </div>

      {/* Bottom Ticker Bar - Pill buttons */}
      <div className="relative z-10 pb-4 sm:pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {TICKER_ITEMS.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
              >
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-full px-3 sm:px-5 py-1.5 sm:py-2.5">
                  <span className="text-xs sm:text-sm font-medium text-white whitespace-nowrap">{item}</span>
                </div>
                {i < TICKER_ITEMS.length - 1 && (
                  <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#D4A843] flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
