// Next.js Proxy — Route Protection (Pengganti middleware.js di Next.js 16)
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

// Routes booking (harus login user)
const BOOKING_ROUTES = ['/book/', '/booking/']

// Routes admin yang TIDAK perlu proteksi (halaman publik admin)
const ADMIN_PUBLIC_ROUTES = [
  '/admin/login',
  '/admin/two-factor',
  '/admin/account-blocked',
]

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const pathname = nextUrl.pathname

  // Jangan proses API routes
  if (pathname.startsWith('/api/')) return NextResponse.next()

  // ─── Admin Routes ─────────────────────────────────────────────────────
  const isAdminPublic = ADMIN_PUBLIC_ROUTES.some(r => pathname.startsWith(r))

  if (pathname.startsWith('/admin') && !isAdminPublic) {
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
    // Match all paths except static files, images, dan NextAuth API routes
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
