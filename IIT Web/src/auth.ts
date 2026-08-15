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
          }
        } catch (error) {
          if (error instanceof ApiError) return null
          throw error
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as "ADMIN" | "ALUMNI" | "USER"
        token.accessToken = user.accessToken as string
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "ADMIN" | "ALUMNI" | "USER"
      }
      session.accessToken = token.accessToken as string
      return session
    },
  },
})
