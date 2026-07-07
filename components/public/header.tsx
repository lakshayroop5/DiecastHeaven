'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Search, ChevronDown, ShoppingBag } from 'lucide-react'
import { useState, useEffect, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { buildWhatsAppLink } from '@/lib/whatsapp'

const navigation = [
  { name: 'Home', href: '/' },
  {
    name: 'Shop',
    href: '/catalog',
    children: [
      { name: 'All Products', href: '/catalog' },
      { name: 'New Arrivals', href: '/catalog?sort=newest' },
      { name: 'Collectibles', href: '/catalog?view=brands' },
    ],
  },
  { name: 'Brands', href: '/catalog?view=brands' },
  { name: 'New Arrivals', href: '/catalog' },
  { name: 'Collectibles', href: '/catalog?category=sets' },
  { name: 'Contact', href: '#contact' },
]

interface HeaderProps {
  whatsappNumber?: string
}

export default function Header({ whatsappNumber = '' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [wantSearch, setWantSearch] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { totalItems } = useCart()

  const handleDropdownEnter = (name: string) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
    setOpenDropdown(name)
  }

  const handleDropdownLeave = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 200)
  }

  useEffect(() => {
    if (wantSearch && mobileMenuOpen && searchInputRef.current) {
      searchInputRef.current.focus()
      setWantSearch(false)
    }
  }, [wantSearch, mobileMenuOpen])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) {
      router.push(`/catalog?search=${encodeURIComponent(q)}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  return (
    <>
    <header className="bg-hotwheels-black/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/diecast-heaven-logo.png"
              alt="Diecast Heaven Udaipur"
              width={120}
              height={120}
              priority
              className="h-16 w-auto object-contain flex-shrink-0"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-8">
          {navigation.map((item) => {
            const href = item.name === 'Contact' && whatsappNumber
              ? buildWhatsAppLink(whatsappNumber)
              : item.href
            return (
            <div
              key={item.name}
              className="relative pb-2"
              onMouseEnter={() => item.children && handleDropdownEnter(item.name)}
              onMouseLeave={() => handleDropdownLeave()}
            >
              <Link
                href={href}
                className={cn(
                  'text-sm font-medium transition-colors inline-flex items-center gap-1',
                  item.name === 'Home'
                    ? 'text-[#D4A843] border-b-2 border-[#D4A843] pb-0.5'
                    : 'text-white hover:text-[#D4A843]'
                )}
              >
                {item.name}
                {item.children && <ChevronDown className="w-3 h-3" />}
              </Link>
              {item.children && openDropdown === item.name && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-hotwheels-gray border border-white/10 rounded-lg shadow-xl py-2 z-50">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-[#D4A843] hover:bg-hotwheels-black transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )})}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-4 lg:flex-1 lg:justify-end">
          <form onSubmit={handleSearch} className="relative mr-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cars, brands..."
              className="w-52 rounded-full bg-white/10 border border-white/10 pl-10 pr-4 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#D4A843]/50 focus:ring-1 focus:ring-[#D4A843]/30 transition-all"
            />
          </form>
          <Link
            href="/cart"
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
            aria-label={`Cart with ${totalItems} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#D4A843] text-black text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex lg:hidden items-center gap-1">
          <button
            type="button"
            className="p-2 text-white"
            onClick={() => {
              setWantSearch(true)
              setMobileMenuOpen(true)
            }}
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/cart"
            className="relative p-2 text-white"
            aria-label={`Cart with ${totalItems} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#D4A843] text-black text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="p-2 text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>
    </header>

    {/* Mobile Menu - rendered outside header to avoid stacking context issues */}
    {mobileMenuOpen && (
      <div
        className="fixed inset-0 z-[60] flex flex-col bg-hotwheels-gray px-6 py-6"
        style={{ animation: 'fade-in 0.2s ease-out' }}
      >
        <div className="flex items-center justify-between mb-8">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <Image
              src="/diecast-heaven-logo.png"
              alt="Diecast Heaven Udaipur"
              width={100}
              height={100}
              className="h-12 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            className="p-2 text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cars, brands..."
              className="w-full rounded-lg bg-hotwheels-black border border-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#D4A843]/50"
            />
          </div>
        </form>

        <nav className="flex-1 flex flex-col justify-center gap-2 max-w-md mx-auto w-full">
          {navigation.map((item) => {
            const href = item.name === 'Contact' && whatsappNumber
              ? buildWhatsAppLink(whatsappNumber)
              : item.href
            return (
            <Link
              key={item.name}
              href={href}
              className="block rounded-lg px-4 py-4 text-center text-lg font-semibold text-white hover:bg-hotwheels-black transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          )})}
          <Link
            href="/cart"
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-4 text-center text-lg font-semibold text-[#D4A843] hover:bg-hotwheels-black transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="bg-[#D4A843] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    )}
    </>
  )
}
