// auth.config.js
// Konfigurasi NextAuth ringan HANYA untuk Proxy/Middleware (Edge-compatible)

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
      // Logika pemblokiran rute khusus ditangani manual di proxy.js
      return true
    },
    // Wajib ada agar proxy bisa baca session.user.role dari JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role ?? 'user'
        token.status = user.status
        token.twoFactorEnabled = user.twoFactorEnabled ?? false
        token.twoFactorVerified = user.twoFactorVerified ?? true
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.status = token.status
        session.user.twoFactorEnabled = token.twoFactorEnabled
        session.user.twoFactorVerified = token.twoFactorVerified
      }
      return session
    },
  },
}
