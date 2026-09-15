/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image domains (storage S3 atau lokal)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: 'tamannasionallorelindu.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  // Rewrites untuk backward compat jika perlu
  async rewrites() {
    return [
      // Alias legacy paths
      { source: '/privacy-policy', destination: '/privacy' },
      { source: '/admin/siteinfo', destination: '/admin/site-info' },
      { source: '/admin/testimonials', destination: '/admin/testimonial' },
      { source: '/feedback', destination: '/testimonials' },
    ]
  },

  // Redirect legacy paths
  async redirects() {
    return [
      { source: '/login/admin', destination: '/admin/login', permanent: true },
      { source: '/user/dashboard', destination: '/dashboard', permanent: true },
      { source: '/user/profile', destination: '/profile', permanent: true },
      { source: '/user/bookings', destination: '/my-bookings', permanent: true },
      { source: '/reset-password', destination: '/forgot-password', permanent: true },
    ]
  },

  // Headers keamanan
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      // Allow VAPID push notifications
      {
        source: '/api/push/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },

  // Logging
  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === 'development' },
  },
}

export default nextConfig
