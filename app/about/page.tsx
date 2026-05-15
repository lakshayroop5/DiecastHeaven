import WhatsAppCTA from '@/components/public/whatsapp-cta'
import { getSiteSettings } from '@/lib/queries'
import type { Metadata } from 'next'

export const revalidate = 3600 // ISR

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About | Hot Wheels Collector',
    description: 'Learn about our Hot Wheels collection and expertise',
  }
}

export default async function AboutPage() {
  const settings = await getSiteSettings()

  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-hotwheels-white mb-4">
            About {settings?.businessName || 'Hot Wheels Collector'}
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
            <div className="bg-hotwheels-gray rounded-lg p-6">
              <h3 className="font-semibold text-hotwheels-yellow mb-2">
                Are all cars authentic Hot Wheels?
              </h3>
              <p className="text-gray-300">
                Yes, every model in our collection is 100% authentic Hot Wheels diecast. 
                We guarantee authenticity on all our products.
              </p>
            </div>
            
            <div className="bg-hotwheels-gray rounded-lg p-6">
              <h3 className="font-semibold text-hotwheels-yellow mb-2">
                How do I know the condition of the car?
              </h3>
              <p className="text-gray-300">
                All cars are described with accurate condition details. Photos show 
                the actual item you'll receive. Contact us if you need more details.
              </p>
            </div>
            
            <div className="bg-hotwheels-gray rounded-lg p-6">
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