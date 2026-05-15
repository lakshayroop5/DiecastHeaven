import Image from 'next/image'
import Link from 'next/link'
import WhatsAppCTA from './whatsapp-cta'

interface HeroProps {
  title: string
  subtitle: string
  ctaText?: string
  ctaLink?: string
  backgroundImage?: string
}

export default function Hero({
  title,
  subtitle,
  ctaText = 'Browse Collection',
  ctaLink = '/catalog',
}: HeroProps) {
  return (
    <div className="relative isolate overflow-hidden bg-hotwheels-black">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-hotwheels-red/20 via-hotwheels-orange/10 to-transparent" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-hotwheels-red rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-hotwheels-yellow rounded-full blur-3xl opacity-10" />
      </div>
      
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-hotwheels-white sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            {subtitle}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href={ctaLink}
              className="rounded-md bg-hotwheels-red px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hotwheels-red transition-colors"
            >
              {ctaText}
            </Link>
            <WhatsAppCTA variant="secondary" />
          </div>
        </div>
      </div>
    </div>
  )
}