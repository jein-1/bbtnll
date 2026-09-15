// auth.config.js
// Konfigurasi NextAuth ringan HANYA untuk Middleware (Edge-compatible)

export const authConfig = {
  providers: [], // Providers diisi di auth.js
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    authorized() {
      // Return true agar NextAuth tidak memblokir otomatis.
      // Logika pemblokiran rute khusus akan ditangani manual di middleware.js
      return true
    },
  },
}
