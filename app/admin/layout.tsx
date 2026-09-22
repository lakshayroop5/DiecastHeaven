'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/brands', label: 'Brands' },
  { href: '/admin/settings', label: 'Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const sidebarContent = (
    <>
      <Link href="/admin" className="text-lg font-bold text-hotwheels-red mb-6" onClick={() => setSidebarOpen(false)}>
        Diecast Admin
      </Link>
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={`block px-3 py-2 rounded text-sm transition-colors ${
              pathname === href
                ? 'bg-hotwheels-red text-white'
                : 'text-gray-300 hover:bg-hotwheels-black hover:text-white'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="mt-auto px-3 py-2 text-sm text-gray-500 hover:text-white transition-colors"
      >
        Logout
      </button>
    </>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-hotwheels-gray border-r border-hotwheels-black p-4 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-56 bg-hotwheels-gray p-4 flex flex-col z-10">
            <button
              type="button"
              className="absolute top-4 right-4 p-1 text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-hotwheels-black bg-hotwheels-gray">
          <button
            type="button"
            className="p-1 text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/admin" className="text-sm font-bold text-hotwheels-red">
            Diecast Admin
          </Link>
        </div>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
