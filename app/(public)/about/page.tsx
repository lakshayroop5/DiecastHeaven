import WhatsAppCTA from '@/components/public/whatsapp-cta'
import { getSiteSettings } from '@/lib/queries'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About',
    description:
      'Diecast Heaven Udaipur - passionate collectors and dealers of premium diecast cars, from vintage classics to the latest releases.',
    alternates: { canonical: '/about' },
  }
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Are all cars authentic diecast at Diecast Heaven Udaipur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, every model at Diecast Heaven Udaipur is 100% authentic diecast from top brands like Hot Wheels, Majorette, Matchbox, Bburago and Tomica. We guarantee authenticity on all our products.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I know the condition of the car?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "All cars are described with accurate condition details. Photos show the actual item you'll receive. Contact us if you need more details.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I request a specific model?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Absolutely! If we don't have it in stock, we can help you find it through our network of collectors.",
      },
    },
  ],
}

export default async function AboutPage() {
  const settings = await getSiteSettings()

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-500 font-mono mb-2">TEAM RADIO // TRANSMISSION</p>
          <h1 className="text-4xl font-black uppercase italic text-hotwheels-white mb-4">
            About {settings?.businessName || process.env.DEFAULT_BUSINESS_NAME || 'Diecast Heaven Udaipur'}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Diecast Heaven Udaipur - your trusted source for premium diecast collector cars
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-black uppercase italic text-hotwheels-white mb-1">
              TEAM RADIO // OUR STORY
            </h2>
            <div aria-hidden="true" className="h-1.5 w-24 mb-4 rounded-sm opacity-80" style={{ backgroundImage: 'repeating-conic-gradient(#fff 0% 25%, #0a0a0a 0% 50%)', backgroundSize: '12px 12px' }} />
            <div className="prose prose-invert">
              <p className="text-gray-300">
                We at Diecast Heaven Udaipur are passionate collectors and dealers of premium diecast cars.
                Our collection features authentic, genuine models from Hot Wheels, Majorette, Matchbox, Bburago, Tomica and more - ranging from
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
              <li>• Authentic diecast models at Diecast Heaven Udaipur</li>
              <li>• Rare and vintage finds</li>
              <li>• Carefully preserved condition</li>
              <li>• Expert knowledge and guidance</li>
              <li>• Fast responses via WhatsApp</li>
            </ul>
          </div>

          <div className="bg-hotwheels-gray rounded-2xl p-8 border border-[#2D2D2D] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-hotwheels-yellow/30 hover:shadow-[0_8px_32px_rgba(250,204,21,0.08)]">
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
            <div className="bg-hotwheels-gray rounded-2xl p-6 border border-[#2D2D2D] transition-all duration-300 hover:border-hotwheels-yellow/30 hover:shadow-[0_8px_24px_rgba(250,204,21,0.08)]">
              <h3 className="font-semibold text-hotwheels-yellow mb-2">
                Are all cars authentic at Diecast Heaven Udaipur?
              </h3>
              <p className="text-gray-300">
                Yes, every model at Diecast Heaven Udaipur is 100% authentic diecast.
                We guarantee authenticity on all our products.
              </p>
            </div>
            
            <div className="bg-hotwheels-gray rounded-2xl p-6 border border-[#2D2D2D] transition-all duration-300 hover:border-hotwheels-yellow/30 hover:shadow-[0_8px_24px_rgba(250,204,21,0.08)]">
              <h3 className="font-semibold text-hotwheels-yellow mb-2">
                How do I know the condition of the car?
              </h3>
              <p className="text-gray-300">
                All cars are described with accurate condition details. Photos show 
                the actual item you'll receive. Contact us if you need more details.
              </p>
            </div>
            
            <div className="bg-hotwheels-gray rounded-2xl p-6 border border-[#2D2D2D] transition-all duration-300 hover:border-hotwheels-yellow/30 hover:shadow-[0_8px_24px_rgba(250,204,21,0.08)]">
              <h3 className="font-semibold text-hotwheels-yellow mb-2">
                Can I request a specific model?
              </h3>
              <p className="text-gray-300">
                Absolutely! If we don't have it in stock, we can help you find it 
                through our network of collectors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}