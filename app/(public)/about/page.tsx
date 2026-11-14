import JsonLd from '@/components/seo/json-ld'
import WhatsAppCTA from '@/components/public/whatsapp-cta'
import { getSiteSettings } from '@/lib/queries'
import type { JsonLdNode } from '@/lib/seo/schema'
import { SITE_LOCALE, SITE_NAME, SITE_URL, defaultOgImage, truncate } from '@/lib/seo/site'
import type { Metadata } from 'next'

const ABOUT_TITLE = `About ${SITE_NAME} — Genuine Diecast Collector Cars`
const ABOUT_DESCRIPTION = truncate(
  `Who we are: a specialist diecast retailer in Udaipur, Rajasthan selling genuine Hot Wheels, Hot Wheels Premium, Majorette, Matchbox, Bburago and Tomica collector cars across India.`,
  158
)

// Single source: the FAQ cards and the FAQPage JSON-LD render from this list,
// so the schema can never drift from the visible copy.
const FAQS = [
  {
    question: 'Are all cars authentic?',
    answer:
      'Yes. Every model is a genuine, officially licensed diecast from its brand — Hot Wheels, Majorette, Matchbox, Bburago, Tomica and others.',
  },
  {
    question: 'How do I know the condition of the car?',
    answer:
      "All cars are described with accurate condition details. Photos show the actual item you'll receive. Contact us if you need more details.",
  },
  {
    question: 'Can I request a specific model?',
    answer:
      "Absolutely! If we don't have it in stock, we can help you find it through our network of collectors.",
  },
] as const

const FAQ_SCHEMA: JsonLdNode = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: ABOUT_TITLE },
    description: ABOUT_DESCRIPTION,
    alternates: { canonical: '/about' },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/about`,
      siteName: SITE_NAME,
      title: ABOUT_TITLE,
      description: ABOUT_DESCRIPTION,
      locale: SITE_LOCALE,
      images: [defaultOgImage()],
    },
    twitter: {
      card: 'summary_large_image',
      title: ABOUT_TITLE,
      description: ABOUT_DESCRIPTION,
      images: [defaultOgImage().url],
    },
  }
}

// Static content - no reason to re-render per request.
export const revalidate = 86400

export default async function AboutPage() {
  const settings = await getSiteSettings()

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <JsonLd data={FAQ_SCHEMA} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-hotwheels-white mb-4">
            About {settings?.businessName || process.env.DEFAULT_BUSINESS_NAME || 'Diecast Heaven Udaipur'}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your trusted source for premium Hot Wheels diecast collector cars
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold text-hotwheels-white mb-4">
              Our Story
            </h2>
            <div className="prose prose-invert">
              <p className="text-gray-300">
                We are passionate collectors and dealers of Hot Wheels diecast cars. 
                Our collection features authentic, genuine Hot Wheels models ranging from 
                vintage classics to the latest releases.
              </p>
              <p className="text-gray-300">
                Every model in our collection is carefully sourced and maintained to 
                preserve its collector value. We understand that each car tells a story 
                and represents a piece of automotive art.
              </p>
              <p className="text-gray-300">
                Whether you're looking for a specific model to complete your collection 
                or discovering new favorites, we're here to help you find exactly what 
                you need.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-hotwheels-white mb-4 mt-8">
              What We Offer
            </h2>
            <ul className="space-y-2 text-gray-300">
              <li>• Authentic Hot Wheels diecast models</li>
              <li>• Rare and vintage finds</li>
              <li>• Carefully preserved condition</li>
              <li>• Expert knowledge and guidance</li>
              <li>• Fast responses via WhatsApp</li>
            </ul>
          </div>

          <div className="bg-hotwheels-gray rounded-lg p-8">
            <h2 className="text-2xl font-bold text-hotwheels-white mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-300 mb-6">
              Have a question about a specific model or looking for something special? 
              Reach out via WhatsApp for the fastest response.
            </p>
            
            <WhatsAppCTA variant="primary" />
            
            <div className="mt-6 pt-6 border-t border-hotwheels-black">
              <h3 className="font-semibold text-hotwheels-yellow mb-2">
                Response Hours
              </h3>
              <p className="text-gray-400 text-sm">
                Monday - Saturday: 10:00 AM - 8:00 PM
              </p>
              <p className="text-gray-400 text-sm">
                Sunday: 10:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-hotwheels-white mb-6">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {FAQS.map(({ question, answer }) => (
              <div key={question} className="bg-hotwheels-gray rounded-lg p-6">
                <h3 className="font-semibold text-hotwheels-yellow mb-2">{question}</h3>
                <p className="text-gray-300">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}