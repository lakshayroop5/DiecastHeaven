import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth-token'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Analytics API gate (auth route stays open)
  if (pathname.startsWith('/api/analytics') && pathname !== '/api/analytics/auth') {
    if (!(await verifySession(process.env.ANALYTICS_PASSWORD ?? '', req.cookies.get('analytics_token')?.value))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Analytics page gate
  if ((pathname === '/analytics' || pathname.startsWith('/analytics/')) && pathname !== '/analytics/login') {
    if (!(await verifySession(process.env.ANALYTICS_PASSWORD ?? '', req.cookies.get('analytics_token')?.value))) {
      return NextResponse.redirect(new URL('/analytics/login', req.url))
    }
    return NextResponse.next()
  }

  // Admin gate (existing behavior)
  if (
    (pathname === '/admin' || pathname.startsWith('/admin/')) &&
    pathname !== '/admin/login' &&
    pathname !== '/api/admin/auth'
  ) {
    if (!(await verifySession(process.env.ADMIN_PASSWORD ?? '', req.cookies.get('admin_token')?.value))) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/analytics/:path*', '/api/analytics/:path*'],
}
