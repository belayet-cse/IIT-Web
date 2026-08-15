"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

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
  { label: "Alumni", href: "/alumni" },
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
          <Link href="/" className="font-heading text-xl font-bold text-navy tracking-tight">
            IITrade
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
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin/alumni"
                className="text-nav text-muted-foreground hover:text-gold transition-colors duration-200"
              >
                Admin Panel
              </Link>
            )}
            {session.user.role === "USER" && (
              <Link
                href="/alumni/apply"
                className="text-nav text-muted-foreground hover:text-gold transition-colors duration-200"
              >
                Apply for Membership
              </Link>
            )}
            <span className="text-nav text-navy font-semibold hidden sm:inline">
              {session.user.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-primary text-primary-foreground text-nav px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-opacity"
            >
              Sign out
            </button>
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
