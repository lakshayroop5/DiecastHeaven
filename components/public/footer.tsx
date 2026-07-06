import Link from 'next/link'

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/catalog?view=brands', label: 'Brands' },
  { href: '/about', label: 'About' },
] as const

export default function Footer() {
  return (
    <footer className="bg-hotwheels-gray border-t border-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-hotwheels-red text-2xl font-extrabold">
              DIECAST HEAVEN
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
            <p className="mt-4 text-sm text-gray-300">
              Contact us via WhatsApp for fastest response on product inquiries.
            </p>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-hotwheels-red hover:text-hotwheels-yellow transition-colors"
            >
              Chat on WhatsApp &rarr;
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-hotwheels-black pt-8">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Diecast Heaven. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
