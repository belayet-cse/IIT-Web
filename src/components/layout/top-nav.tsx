"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { UserMenu } from "./user-menu"

interface NavLink {
  label: string
  href: string
}

interface TopNavProps {
  links?: NavLink[]
  className?: string
}

const defaultLinks: NavLink[] = [
  { label: "Programs", href: "/programs" },
  { label: "Research", href: "/research" },
  { label: "Blogs", href: "/blogs" },
  { label: "Events", href: "/events" },
  { label: "Alumni", href: "/alumni" },
  { label: "Forum", href: "/forum" },
  { label: "Researchers", href: "/researcher" },
  { label: "About Us", href: "/about" },
]

export function TopNav({ links = defaultLinks, className }: TopNavProps) {
  const { data: session, status } = useSession()

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 bg-card border-b border-border",
      className
    )}>
      <div className="max-w-[1180px] mx-auto px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image src="/iit-logo.png" alt="Institute of International Trade" width={186} height={50} priority className="h-10 w-auto" />
          </Link>
          <div className="hidden md:flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-nav text-muted-foreground hover:text-gold transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {status === "authenticated" && session.user ? (
          <div className="flex items-center gap-4">
            {session.user.role === "GENERAL" && (
              <Link
                href="/alumni/apply"
                className="text-nav text-muted-foreground hover:text-gold transition-colors duration-200"
              >
                Apply for Membership
              </Link>
            )}
            <UserMenu name={session.user.name ?? "Account"} isAdmin={session.user.role === "ADMIN"} />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-nav text-muted-foreground hover:text-gold transition-colors duration-200">
              Login
            </Link>
            <Link
              href="/alumni/apply"
              className="bg-primary text-primary-foreground text-nav px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-opacity"
            >
              Apply Now
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
