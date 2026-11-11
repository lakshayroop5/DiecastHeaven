import Link from 'next/link'
import { MapPin, Phone, Clock, Navigation, Instagram, Youtube, MessageCircle } from 'lucide-react'
import { getSiteSettings } from '@/lib/queries'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { POLICIES } from '@/lib/policies'

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/catalog?view=brands', label: 'Brands' },
  { href: '/about', label: 'About' },
] as const

export default async function Footer() {
  const settings = await getSiteSettings()
  const whatsappNumber = settings?.whatsappNumber || ''

  return (
    <footer className="race-carbon bg-hotwheels-gray border-t border-[#D4A843]/15">
      <div className="race-chequer h-2.5 w-full opacity-90" aria-hidden="true" />
      <div className="h-px bg-gradient-to-r from-transparent via-[#D4A843]/50 to-transparent" />
      {/* Pit-wall marquee wordmark */}
      <div className="overflow-hidden border-b border-white/5 py-3" aria-hidden="true">
        <div className="flex w-max animate-marquee items-center gap-8 pr-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-2xl font-black italic uppercase tracking-tight text-white/[0.07] whitespace-nowrap">
              Diecast Heaven Udaipur
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="race-asphalt grid grid-cols-1 gap-10 rounded-xl border border-white/5 p-4 sm:grid-cols-2 md:grid-cols-3 md:gap-8">
          {/* Brand */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <Link href="/" className="text-hotwheels-red text-2xl font-black italic uppercase tracking-tight">
              DIECAST HEAVEN <span className="text-white">UDAIPUR</span>
            </Link>
            <p className="mt-2 text-sm text-gray-300">
              India&apos;s premium diecast destination. Genuine collector cars from Hot Wheels, Majorette, Matchbox, Bburago, Tomica, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-hotwheels-yellow">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-300 hover:text-hotwheels-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-hotwheels-yellow">Contact</h3>
            <div className="mt-4 space-y-3">
              <p className="flex items-start gap-2 text-sm text-gray-300">
                <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5 text-hotwheels-yellow" />
                <span>BVR Super Mart, Block-E, 335, near Goverdhan Villas, Transport Nagar, Hiran Magri, Udaipur, Rajasthan 313001</span>
              </p>
              <p className="flex items-start gap-2 text-sm text-gray-300">
                <Phone aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5 text-hotwheels-yellow" />
                <a href="tel:+919079674984" className="hover:text-hotwheels-white transition-colors">
                  +91 90796 74984
                </a>
              </p>
              <p className="flex items-start gap-2 text-sm text-gray-300">
                <Clock aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5 text-hotwheels-yellow" />
                <span>Open Mon–Sat: 10:00 AM – 8:00 PM<br />Sunday: 10:00 AM – 6:00 PM</span>
              </p>
              <p className="flex items-start gap-2 text-sm">
                <Navigation aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5 text-hotwheels-red" />
                <a
                  href="https://maps.app.goo.gl/3C6nyt5BbfqXL3hdA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-hotwheels-red hover:text-hotwheels-yellow transition-colors"
                >
                  Get directions &rarr;
                </a>
              </p>
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-gray-300">
              <MessageCircle aria-hidden="true" className="h-4 w-4 shrink-0 mt-0.5 text-hotwheels-yellow" />
              <span>Questions about a model, shipping, or pre-orders? Chat with us on WhatsApp — fastest response.</span>
            </p>
            {whatsappNumber && (
              <a
                href={buildWhatsAppLink(whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-hotwheels-red hover:text-hotwheels-yellow transition-colors"
              >
                Chat on WhatsApp &rarr;
              </a>
            )}
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.instagram.com/diecast_heaven_udaipur/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-300 hover:text-hotwheels-yellow transition-colors"
              >
                <Instagram aria-hidden="true" className="h-4 w-4 shrink-0" />
              </a>
              <a
                href="https://www.youtube.com/@diecastheaven-udaipur"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-gray-300 hover:text-hotwheels-yellow transition-colors"
              >
                <Youtube aria-hidden="true" className="h-4 w-4 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-hotwheels-black pt-8">
          <nav aria-label="Policies" className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {POLICIES.map(({ slug, title }) => (
              <Link
                key={slug}
                href={`/policies/${slug}`}
                className="text-xs text-gray-300 hover:text-hotwheels-white transition-colors"
              >
                {title}
              </Link>
            ))}
          </nav>
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} {settings?.businessName || process.env.DEFAULT_BUSINESS_NAME || 'Diecast Heaven Udaipur'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
