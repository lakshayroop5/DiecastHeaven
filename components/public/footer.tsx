import Link from 'next/link'
import { getSiteSettings } from '@/lib/queries'
import { BUSINESS } from '@/lib/seo/site'
import { BUSINESS_ADDRESS, POLICIES } from '@/lib/policies'
import { buildWhatsAppLink } from '@/lib/whatsapp'

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/brands', label: 'Brands' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
}

function socialLabel(url: string) {
  const match = Object.entries(SOCIAL_LABELS).find(([key]) => url.toLowerCase().includes(key))
  return match ? match[1] : 'Follow us'
}

/** "Monday" ... "Sunday" -> "Mon–Sun"; renders as "Mon–Sun: 10:00 – 20:00". */
function hourLine(days: readonly string[], opens: string, closes: string) {
  const label =
    days.length > 1
      ? `${days[0].slice(0, 3)}–${days[days.length - 1].slice(0, 3)}`
      : days[0]
  return `${label}: ${opens} – ${closes}`
}

export default async function Footer() {
  const settings = await getSiteSettings()
  const whatsappNumber = settings?.whatsappNumber || ''

  // +919079674984 -> +91 90796 74984
  const phoneDisplay = `+91 ${BUSINESS.telephone.slice(3, 8)} ${BUSINESS.telephone.slice(8)}`

  return (
    <footer className="bg-hotwheels-gray border-t border-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-hotwheels-red text-2xl font-extrabold">
              DIECAST HEAVEN UDAIPUR
            </Link>
            <p className="mt-2 text-sm text-gray-300">
              India&apos;s premium diecast destination. Genuine collector cars from Hot Wheels, Majorette, Matchbox, Bburago, Tomica, and more.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {BUSINESS.sameAs.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-hotwheels-white transition-colors"
                >
                  {socialLabel(url)} &rarr;
                </a>
              ))}
            </div>
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
            <address className="mt-4 space-y-2 not-italic text-sm text-gray-300">
              <p>{BUSINESS.name}</p>
              <p>{BUSINESS_ADDRESS}</p>
              <p>
                <a
                  href={`tel:${BUSINESS.telephone}`}
                  className="hover:text-hotwheels-white transition-colors"
                >
                  {phoneDisplay}
                </a>
              </p>
              <p>
                {BUSINESS.openingHoursSpecification.map(({ days, opens, closes }) => (
                  <span key={days.join()} className="block">
                    {hourLine(days, opens, closes)}
                  </span>
                ))}
              </p>
              <p>
                <a
                  href={BUSINESS.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-hotwheels-red hover:text-hotwheels-yellow transition-colors"
                >
                  Get directions &rarr;
                </a>
              </p>
            </address>
            <p className="mt-3 text-sm text-gray-300">
              Contact us via WhatsApp for fastest response on product inquiries.
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
