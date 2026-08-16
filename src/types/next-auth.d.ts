import type { DefaultSession } from "next-auth"

type AppRole = "ADMIN" | "ALUMNI" | "GENERAL" | "PREMIUM" | "RESEARCHER"
type AppMembershipTier = "BASIC" | "PRO" | "ELITE"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    mustChangePassword?: boolean
    membershipTier?: AppMembershipTier | null
    user: {
      id: string
      role: AppRole
    } & DefaultSession["user"]
  }

  interface User {
    role?: AppRole
    accessToken?: string
    mustChangePassword?: boolean
    membershipTier?: AppMembershipTier | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: AppRole
    accessToken?: string
    mustChangePassword?: boolean
    membershipTier?: AppMembershipTier | null
  }
}
