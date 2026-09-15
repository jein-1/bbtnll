import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    // ─── User Credentials ─────────────────────────────────────────────────
    Credentials({
      id: 'user-credentials',
      name: 'User Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true, name: true, email: true, username: true,
            password: true, status: true, avatar: true,
          },
        })
        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        if (user.status === 'blocked') {
          throw new Error('ACCOUNT_BLOCKED')
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: 'user',
          status: user.status,
        }
      },
    }),

    // ─── Admin Credentials ────────────────────────────────────────────────
    Credentials({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
          select: {
            id: true, name: true, email: true, username: true,
            password: true, isActive: true, role: true,
            twoFactorEnabled: true, twoFactorSecret: true,
          },
        })
        if (!admin) return null

        const isValid = await bcrypt.compare(credentials.password, admin.password)
        if (!isValid) return null

        if (!admin.isActive) {
          throw new Error('ADMIN_BLOCKED')
        }

        await prisma.admin.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: String(admin.id),
          name: admin.name,
          email: admin.email,
          role: admin.role === 'super_admin' ? 'super_admin' : 'admin',
          twoFactorEnabled: admin.twoFactorEnabled,
          twoFactorVerified: false, // must verify 2FA separately
        }
      },
    }),

    // ─── Google OAuth (User only) ─────────────────────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          googleId: profile.sub,
          role: 'user',
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
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
})
