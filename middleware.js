// Next.js Middleware — Route Protection
// Mengganti Laravel middleware: auth, admin, role-check

import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

// Routes yang memerlukan login USER biasa
const USER_ROUTES = [
  '/dashboard', '/profile', '/my-bookings', '/my-reviews',
  '/wishlist', '/notifications', '/activity-log',
]

// Routes yang memerlukan login ADMIN
const ADMIN_ROUTES = ['/admin']

// Routes booking (harus login user)
const BOOKING_ROUTES = ['/book/', '/booking/']

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const pathname = nextUrl.pathname

  // ─── Admin Routes ─────────────────────────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/two-factor/verify' && pathname !== '/admin/account-blocked') {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    const role = session.user?.role
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    // 2FA check
    if (session.user?.twoFactorEnabled && !session.user?.twoFactorVerified) {
      return NextResponse.redirect(new URL('/admin/two-factor/verify', req.url))
    }
    return NextResponse.next()
  }

  // ─── User Protected Routes ─────────────────────────────────────────────
  const isUserRoute = USER_ROUTES.some(r => pathname.startsWith(r))
  const isBookingRoute = BOOKING_ROUTES.some(r => pathname.startsWith(r))

  if (isUserRoute || isBookingRoute) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (session.user?.status === 'blocked') {
      return NextResponse.redirect(new URL('/account-blocked', req.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Match all paths except static files, images, api/auth
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
