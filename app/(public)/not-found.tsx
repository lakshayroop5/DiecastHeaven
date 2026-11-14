import Link from 'next/link'
import { Package } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-hotwheels-black flex items-center justify-center">
      <div className="text-center px-4">
        <Package className="h-24 w-24 text-hotwheels-red mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-hotwheels-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="rounded-md bg-hotwheels-red px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/catalog"
            className="rounded-md bg-hotwheels-gray px-6 py-3 text-sm font-semibold text-hotwheels-white hover:bg-hotwheels-black transition-colors"
          >
            Browse Catalog
          </Link>
          <Link
            href="/brands"
            className="rounded-md bg-hotwheels-gray px-6 py-3 text-sm font-semibold text-hotwheels-white hover:bg-hotwheels-black transition-colors"
          >
            Shop by Brand
          </Link>
        </div>
      </div>
    </div>
  )
}
