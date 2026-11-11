import Link from 'next/link'
import WhatsAppCTA from './whatsapp-cta'
import HeroSlides, { type HeroSlide } from './hero-slides'

interface HeroProps {
  title: string
  subtitle: string
  ctaText?: string
  ctaLink?: string
  media?: HeroSlide[]
}

const FALLBACK_SLIDES: HeroSlide[] = [{ id: 'default', url: '/hero-banner.jpeg', type: 'IMAGE' }]

const TELEMETRY = [
  'LAP 01 // UDAIPUR CIRCUIT',
  '500+ LIVERIES ON GRID',
  '1:43 POLE SCALE',
  'PAN-INDIA DRS ENABLED',
  'NEW ARRIVALS PIT-LANE FRESH',
  'GENUINE // BRAND-NEW ONLY',
]

const STATS = [
  { value: '500+', label: 'LIVERY' },
  { value: '1:43', label: 'POLE' },
  { value: 'PAN-INDIA', label: 'DRS' },
]

export default function Hero({
  title,
  subtitle,
  ctaText = 'ENTER THE GRID',
  ctaLink = '/catalog',
  media = [],
}: HeroProps) {
  const slides = media.length > 0 ? media : FALLBACK_SLIDES

  return (
    <div className="relative w-full min-h-[60vh] sm:min-h-[75vh] lg:min-h-[85vh] flex flex-col justify-center bg-apex-asphalt overflow-hidden grain">
      {/* Background media layers - z-0 to avoid negative z-index stacking bugs. Pointer events ON so users can drag/swipe slides. */}
      <div className="absolute inset-0 z-0 select-none">
        <div className="absolute inset-0 race-parallax">
          <HeroSlides slides={slides} />
        </div>
        {/* Pit-lane night grade + asphalt texture */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/20 pointer-events-none" />
        <div className="absolute inset-0 race-asphalt opacity-60 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
        {/* Speed lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="animate-speed absolute top-1/4 left-0 h-px w-1/3 bg-gradient-to-r from-transparent via-apex-redline/70 to-transparent" />
          <div className="animate-speed absolute top-1/2 left-0 h-px w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ animationDelay: '0.9s' }} />
          <div className="animate-speed absolute top-3/4 left-0 h-px w-1/4 bg-gradient-to-r from-transparent via-apex-redline/50 to-transparent" style={{ animationDelay: '1.7s' }} />
        </div>
      </div>

      {/* Ghost number behind content */}
      <div
        aria-hidden="true"
        className="race-ghost hero-ghost-drift pointer-events-none absolute -top-4 right-0 z-[1] select-none text-[clamp(8rem,28vw,22rem)] font-black italic leading-none tracking-tighter"
      >
        01
      </div>

      {/* Content - z-10 to overlay perfectly. pointer-events-none so drags pass through to slides; interactive elements re-enable it. */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 flex-1 flex flex-col justify-center pointer-events-none">
        <div className="max-w-2xl">
          <p className="hero-fade mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-apex-redline/60 bg-black/60 px-3 sm:px-4 py-1 text-[11px] sm:text-xs font-bold uppercase italic tracking-[0.2em] text-white backdrop-blur-sm" style={{ animationDelay: '0.05s' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-apex-redline animate-pulse" />
            Diecast Heaven Udaipur // Lap 01
          </p>
          <h1 className="text-[clamp(2.4rem,8vw,5.5rem)] font-black italic uppercase text-white leading-[0.95] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            {title.split(' ').map((word, i) => (
              <span key={i} className="hero-word-mask mr-[0.22em] last:mr-0">
                <span className="hero-word" style={{ animationDelay: `${0.1 + i * 0.09}s` }}>
                  {word}
                </span>
              </span>
            ))}
          </h1>
          <p className="hero-fade mt-4 sm:mt-6 text-sm sm:text-lg text-gray-300 drop-shadow-sm max-w-xl" style={{ animationDelay: '0.45s' }}>
            {subtitle}
          </p>

          {/* Start lights + RPM */}
          <div className="hero-fade mt-5 flex items-center gap-3" aria-hidden="true" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 backdrop-blur-sm">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="animate-startlights h-2 w-2 rounded-full" style={{ animationDelay: `${i * 0.25}s` }} />
              ))}
            </div>
            <div className="h-1.5 w-24 sm:w-40 overflow-hidden rounded-full bg-white/10">
              <div className="animate-rpm h-full w-1/2 rounded-full bg-gradient-to-r from-apex-redline via-amber-400 to-green-500" />
            </div>
            <span className="text-[10px] font-bold uppercase italic tracking-[0.25em] text-white/50">RPM</span>
          </div>

          <div className="hero-fade mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 pointer-events-auto" style={{ animationDelay: '0.72s' }}>
            <Link
              href={ctaLink}
              className="btn-shine -skew-x-6 rounded-lg bg-apex-redline px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-black italic uppercase tracking-wider text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_30px_-6px_rgba(255,30,45,0.6)]"
            >
              <span className="inline-block skew-x-6">{ctaText}</span>
            </Link>
            <Link
              href="/catalog?sort=newest"
              className="rounded-lg border border-white/40 bg-white/5 backdrop-blur-sm text-white px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold italic uppercase tracking-wider hover:bg-white/15 hover:border-white/70 active:scale-[0.98] transition-all shadow-sm"
            >
              New Arrivals
            </Link>
            <WhatsAppCTA variant="hero" />
          </div>

          {/* Stats row */}
          <div className="hero-fade mt-6 sm:mt-8 flex items-stretch gap-2 sm:gap-3 pointer-events-auto" aria-label="Store stats" style={{ animationDelay: '0.85s' }}>
            {STATS.map((s, si) => (
              <div
                key={s.label}
                className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 sm:px-4 py-2.5 backdrop-blur-sm"
                style={{ animationDelay: `${0.85 + si * 0.08}s` }}
              >
                <p className="text-sm sm:text-xl font-black italic tracking-tight text-white">{s.value}</p>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-apex-redline">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Telemetry ticker - seamless marquee-fast with chequer separators */}
      <div className="relative z-10 border-t border-white/10 bg-black/70 backdrop-blur-sm" aria-hidden="true">
        <div className="flex w-max animate-marquee-fast items-center py-2 pr-4">
          {[...TELEMETRY, ...TELEMETRY].map((item, i) => (
            <div key={i} className="flex items-center flex-shrink-0">
              <span className="px-4 text-[11px] sm:text-xs font-bold italic uppercase tracking-[0.2em] text-white/80 whitespace-nowrap">
                {item}
              </span>
              <span className="race-chequer inline-block h-3 w-6 flex-shrink-0 rounded-[2px] opacity-80" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
