import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-hotwheels-gray border-t border-hotwheels-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-hotwheels-red text-2xl font-extrabold">
              HOT WHEELS
            </Link>
            <p className="mt-2 text-sm text-gray-300">
              Premium diecast collector cars. Genuine Hot Wheels for serious collectors.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-hotwheels-yellow">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-300 hover:text-hotwheels-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-sm text-gray-300 hover:text-hotwheels-white transition-colors">
                  Catalog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-300 hover:text-hotwheels-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-hotwheels-yellow">Contact</h3>
            <p className="mt-4 text-sm text-gray-300">
              Contact us via WhatsApp for fastest response on product inquiries.
            </p>
          </div>
        </div>
        
        <div className="mt-8 border-t border-hotwheels-black pt-8">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Hot Wheels Collector. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}