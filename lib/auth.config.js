// auth.config.js
// Konfigurasi NextAuth ringan HANYA untuk Middleware (Edge-compatible)

export const authConfig = {
  providers: [], // Providers diisi di auth.js
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
}
