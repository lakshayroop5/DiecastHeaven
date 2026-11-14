import type { Metadata } from 'next'
import Link from 'next/link'
import { BUSINESS, SITE_LOCALE, SITE_NAME, SITE_URL, defaultOgImage } from '@/lib/seo/site'
import { buildWhatsAppLink } from '@/lib/whatsapp'

const CONTACT_TITLE = `Contact ${SITE_NAME} — Store, Phone & WhatsApp`
const CONTACT_DESCRIPTION =
  'Visit Diecast Heaven Udaipur at BVR Super Mart, Hiran Magri for genuine Hot Wheels and diecast cars. Call or WhatsApp for stock, shipping and pre-orders.'

export function generateMetadata(): Metadata {
  return {
    title: { absolute: CONTACT_TITLE },
    description: CONTACT_DESCRIPTION,
    alternates: { canonical: '/contact' },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/contact`,
      siteName: SITE_NAME,
      title: CONTACT_TITLE,
      description: CONTACT_DESCRIPTION,
      locale: SITE_LOCALE,
      images: [defaultOgImage()],
    },
    twitter: {
      card: 'summary_large_image',
      title: CONTACT_TITLE,
      description: CONTACT_DESCRIPTION,
      images: [defaultOgImage().url],
    },
  }
}

// Static content - no reason to re-render per request.
export const revalidate = 86400

const POLICY_LINKS = [
  {
    title: 'Shipping',
    href: '/policies/shipping',
    body: 'Charges are calculated by packed weight and destination, and confirmed before payment.',
  },
  {
    title: 'Returns',
    href: '/policies/refund',
    body: 'Replacements for damaged or incorrect items, with an unboxing video.',
  },
  {
    title: 'Pre-orders',
    href: '/policies/pre-order',
    body: 'Pre-order items show a deposit payable while ordering; the balance is due on delivery.',
  },
]

/** "Monday…Saturday" -> "Mon – Sat"; short lists stay explicit. */
function dayLabel(days: readonly string[]): string {
  return days.length > 2
    ? `${days[0].slice(0, 3)} – ${days[days.length - 1].slice(0, 3)}`
    : days.map((day) => day.slice(0, 3)).join(', ')
}

export default function ContactPage() {
  const { address } = BUSINESS

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-hotwheels-white mb-4">
            Contact {SITE_NAME}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Visit our store in Udaipur or reach out on WhatsApp for the fastest response.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-hotwheels-gray rounded-2xl p-8 border border-[#2D2D2D]">
            <h2 className="text-2xl font-bold text-hotwheels-white mb-4">Store Address</h2>
            <address className="text-gray-300 not-italic leading-relaxed">
              <span className="block text-hotwheels-white font-semibold mb-1">
                {SITE_NAME}
              </span>
              {address.streetAddress}
              <br />
              {address.addressLocality}, {address.addressRegion} {address.postalCode}
              <br />
              {address.addressCountry === 'IN' ? 'India' : address.addressCountry}
            </address>

            <div className="mt-6 space-y-3">
              <p>
                <a
                  href={`tel:${BUSINESS.telephone}`}
                  className="text-hotwheels-yellow hover:text-hotwheels-white transition-colors"
                >
                  {BUSINESS.telephone.replace('+91', '+91 ')}
                </a>
              </p>
              <p>
                <a
                  href={buildWhatsAppLink(BUSINESS.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-hotwheels-red hover:text-hotwheels-yellow transition-colors"
                >
                  Chat on WhatsApp &rarr;
                </a>
              </p>
              <p>
                <a
                  href={BUSINESS.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-hotwheels-red hover:text-hotwheels-yellow transition-colors"
                >
                  Get directions &rarr;
                </a>
              </p>
            </div>
          </div>

          <div className="bg-hotwheels-gray rounded-2xl p-8 border border-[#2D2D2D]">
            <h2 className="text-2xl font-bold text-hotwheels-white mb-4">Store Hours</h2>
            <table className="w-full text-gray-300">
              <tbody>
                {BUSINESS.openingHoursSpecification.map((slot) => (
                  <tr key={dayLabel(slot.days)} className="border-b border-hotwheels-black last:border-0">
                    <td className="py-2">{dayLabel(slot.days)}</td>
                    <td className="py-2 text-right tabular-nums">
                      {slot.opens} – {slot.closes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm text-gray-400">Price range: {BUSINESS.priceRange}</p>

            <h2 className="text-2xl font-bold text-hotwheels-white mb-4 mt-8">Follow Us</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {BUSINESS.sameAs.map((profile) => (
                <a
                  key={profile}
                  href={profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-hotwheels-white transition-colors"
                >
                  {profile.includes('instagram') ? 'Instagram' : 'YouTube'}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {POLICY_LINKS.map((policy) => (
            <Link
              key={policy.href}
              href={policy.href}
              className="block bg-hotwheels-gray rounded-2xl p-6 border border-[#2D2D2D] transition-colors hover:border-hotwheels-yellow/30"
            >
              <h2 className="font-semibold text-hotwheels-yellow mb-2">{policy.title}</h2>
              <p className="text-gray-300">{policy.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
