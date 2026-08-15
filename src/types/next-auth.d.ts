import type { DefaultSession } from "next-auth"

type AppRole = "ADMIN" | "ALUMNI" | "USER"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      role: AppRole
    } & DefaultSession["user"]
  }

  interface User {
    role?: AppRole
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: AppRole
    accessToken?: string
  }
}
