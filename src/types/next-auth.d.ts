import type { DefaultSession } from "next-auth"

type AppRole = "ADMIN" | "ALUMNI" | "GENERAL" | "PREMIUM" | "RESEARCHER"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    mustChangePassword?: boolean
    user: {
      id: string
      role: AppRole
    } & DefaultSession["user"]
  }

  interface User {
    role?: AppRole
    accessToken?: string
    mustChangePassword?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: AppRole
    accessToken?: string
    mustChangePassword?: boolean
  }
}
