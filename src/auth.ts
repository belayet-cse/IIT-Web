import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { ApiError, loginUser } from "@/lib/api"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        try {
          const { accessToken, user } = await loginUser({ email, password })
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken,
            mustChangePassword: user.mustChangePassword,
            membershipTier: user.membershipTier,
          }
        } catch (error) {
          if (error instanceof ApiError) return null
          throw error
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // Auto-logout on inactivity: session expires this long after the last
    // request that touches it; updateAge keeps rolling the expiry forward
    // while the user stays active.
    maxAge: 30 * 60,
    updateAge: 5 * 60,
  },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as "ADMIN" | "ALUMNI" | "GENERAL" | "PREMIUM" | "RESEARCHER"
        token.accessToken = user.accessToken as string
        token.mustChangePassword = user.mustChangePassword as boolean
        token.membershipTier = user.membershipTier as "BASIC" | "PRO" | "ELITE" | null
      }
      if (trigger === "update" && session?.mustChangePassword !== undefined) {
        token.mustChangePassword = session.mustChangePassword as boolean
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "ADMIN" | "ALUMNI" | "GENERAL" | "PREMIUM" | "RESEARCHER"
      }
      session.accessToken = token.accessToken as string
      session.mustChangePassword = token.mustChangePassword as boolean
      session.membershipTier = token.membershipTier as "BASIC" | "PRO" | "ELITE" | null
      return session
    },
  },
})
