import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contact',
    description:
      'Visit Diecast Heaven Udaipur at BVR Super Mart, Transport Nagar, Udaipur or chat on WhatsApp for product inquiries, shipping, returns and pre-orders.',
    alternates: { canonical: '/contact' },
  }
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-500 font-mono mb-2">TRACK MAP // PIT LANE</p>
          <h1 className="text-4xl font-black uppercase italic text-hotwheels-white mb-4">
            Contact Diecast Heaven Udaipur
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Visit our store or reach out on WhatsApp for the fastest response
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-hotwheels-gray rounded-lg p-8 border border-[#2D2D2D] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-hotwheels-red/50 hover:shadow-[0_8px_32px_rgba(230,0,0,0.15)] overflow-hidden relative">
            <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundImage: 'repeating-conic-gradient(#fff 0% 25%, #0a0a0a 0% 50%)', backgroundSize: '12px 12px' }} />
            <h2 className="text-2xl font-black uppercase italic text-hotwheels-white mb-1 mt-1">
              TRACK MAP // STORE ADDRESS
            </h2>
            <address className="text-gray-300 not-italic">
              Diecast Heaven Udaipur
              <br />
              BVR Super Mart, Block-E, 335, near Goverdhan Villas,
              <br />
              Transport Nagar, Hiran Magri,
              <br />
              Udaipur, Rajasthan 313001
            </address>
            <p className="mt-4">
              <a
                href="tel:+919079674984"
                className="text-hotwheels-yellow hover:text-hotwheels-white transition-colors"
              >
                +91-9079674984
              </a>
            </p>
            <p className="mt-2">
              <a
                href="https://wa.me/919079674984"
                target="_blank"
                rel="noopener noreferrer"
                className="text-hotwheels-red hover:text-hotwheels-yellow transition-colors"
              >
                Chat on WhatsApp &rarr;
              </a>
            </p>
            <p className="mt-4">
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

          <div className="bg-hotwheels-gray rounded-2xl p-8 border border-[#2D2D2D] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-hotwheels-yellow/30 hover:shadow-[0_8px_32px_rgba(250,204,21,0.08)]">
            <h2 className="text-2xl font-bold text-hotwheels-white mb-4">
              Store Hours
            </h2>
            <table className="w-full text-gray-300">
              <tbody>
                <tr className="border-b border-hotwheels-black">
                  <td className="py-2">Monday – Saturday</td>
                  <td className="py-2 text-right">10 – 8</td>
                </tr>
                <tr>
                  <td className="py-2">Sunday</td>
                  <td className="py-2 text-right">10 – 6</td>
                </tr>
              </tbody>
            </table>
            <h2 className="text-2xl font-bold text-hotwheels-white mb-4 mt-8">
              Follow Us
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <a
                href="https://www.instagram.com/diecast_heaven_udaipur/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-hotwheels-white transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.youtube.com/@diecastheaven-udaipur"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-hotwheels-white transition-colors"
              >
                YouTube
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbBG9XGKLaHmaCOn3n3J"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-300 hover:text-hotwheels-white transition-colors"
              >
                WhatsApp Channel
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <div className="bg-hotwheels-gray rounded-2xl p-6 border border-[#2D2D2D] transition-all duration-300 hover:border-hotwheels-yellow/30 hover:shadow-[0_8px_24px_rgba(250,204,21,0.08)]">
            <h2 className="font-semibold text-hotwheels-yellow mb-2">Shipping</h2>
            <p className="text-gray-300">
              Shipping across India; charges and timelines confirmed on WhatsApp
            </p>
          </div>
          <div className="bg-hotwheels-gray rounded-2xl p-6 border border-[#2D2D2D] transition-all duration-300 hover:border-hotwheels-yellow/30 hover:shadow-[0_8px_24px_rgba(250,204,21,0.08)]">
            <h2 className="font-semibold text-hotwheels-yellow mb-2">Returns</h2>
            <p className="text-gray-300">
              Returns in genuine cases as discussed on WhatsApp
            </p>
          </div>
          <div className="bg-hotwheels-gray rounded-2xl p-6 border border-[#2D2D2D] transition-all duration-300 hover:border-hotwheels-yellow/30 hover:shadow-[0_8px_24px_rgba(250,204,21,0.08)]">
            <h2 className="font-semibold text-hotwheels-yellow mb-2">Pre-orders</h2>
            <p className="text-gray-300">
              Pre-order items show deposit amounts payable while ordering, balance due on
              delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
