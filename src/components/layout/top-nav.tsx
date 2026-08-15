"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { ChevronDown, ChevronRight, LayoutDashboard, LogIn, LogOut, Menu, X } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

interface DropdownItem {
  label: string
  href: string
  children?: DropdownItem[]
}

interface NavLink {
  label: string
  href: string
  children?: DropdownItem[]
}

interface TopNavProps {
  className?: string
}

const NAV_LINKS: NavLink[] = [
  {
    label: "Home",
    href: "/",
    children: [
      {
        label: "About Us",
        href: "/about",
        children: [{ label: "Board of Directors", href: "/about#board-of-directors" }],
      },
    ],
  },
  { label: "Blogs", href: "/blog" },
  { label: "Events", href: "/events" },
  { label: "Resources", href: "/research" },
  { label: "Alumni", href: "/alumni" },
  { label: "Trade Query", href: "/qa" },
]

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

export function TopNav({ className }: TopNavProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [mobileSubExpanded, setMobileSubExpanded] = useState<string | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null)
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const subDropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")

  const openDropdown = (label: string) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current)
    setActiveDropdown(label)
  }
  const closeDropdown = (label: string) => {
    dropdownTimerRef.current = setTimeout(() => {
      setActiveDropdown((cur) => (cur === label ? null : cur))
    }, 120)
  }
  const openSubDropdown = (label: string) => {
    if (subDropdownTimerRef.current) clearTimeout(subDropdownTimerRef.current)
    setActiveSubDropdown(label)
  }
  const closeSubDropdown = (label: string) => {
    subDropdownTimerRef.current = setTimeout(() => {
      setActiveSubDropdown((cur) => (cur === label ? null : cur))
    }, 120)
  }

  return (
    <div className={cn("relative z-50", className)}>
      {/* Topbar */}
      <div className="hidden sm:flex items-center justify-between bg-[#0a3066] text-white text-xs px-4 sm:px-6 lg:px-8 py-1.5">
        <span className="truncate">Excellence in International Trade Solution &amp; Innovation</span>
        <div className="flex items-center gap-3">
          <a
            href="https://www.linkedin.com/company/institute-of-international-trade-iit/about/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-[#f59e0b] transition-colors"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61577748026721"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-[#f59e0b] transition-colors"
            aria-label="Facebook"
          >
            <FacebookIcon />
          </a>
          <a
            href="https://www.youtube.com/channel/UCAe6sZU944oeLVGQ2bOsehg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-[#f59e0b] transition-colors"
            aria-label="YouTube"
          >
            <YouTubeIcon />
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav className="sticky top-0 bg-white border-b border-border shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-4">
          <Link href="/" className="flex items-center flex-shrink-0 mr-2">
            <Image
              src="/iit-logo.png"
              alt="Institute of International Trade"
              width={150}
              height={54}
              priority
              style={{ objectFit: "contain", height: 48, width: "auto" }}
            />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1 flex-1 list-none">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href)
              const hasChildren = !!link.children?.length
              return (
                <li
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => hasChildren && openDropdown(link.label)}
                  onMouseLeave={() => hasChildren && closeDropdown(link.label)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                      active ? "text-[#0a3066] font-semibold" : "text-gray-700 hover:text-[#0a3066]"
                    )}
                  >
                    {link.label}
                    {hasChildren && (
                      <ChevronDown className={cn("h-3 w-3 transition-transform", activeDropdown === link.label && "rotate-180")} />
                    )}
                  </Link>

                  {hasChildren && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[200px] py-1.5">
                      {link.children!.map((child) => {
                        const childHasChildren = !!child.children?.length
                        return (
                          <div
                            key={child.href}
                            className="relative"
                            onMouseEnter={() => childHasChildren && openSubDropdown(child.label)}
                            onMouseLeave={() => childHasChildren && closeSubDropdown(child.label)}
                          >
                            <Link
                              href={child.href}
                              className="flex items-center justify-between gap-2 px-4 py-2.5 text-[13px] text-gray-600 hover:text-[#0a3066] hover:bg-gray-50 transition-colors"
                            >
                              {child.label}
                              {childHasChildren && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />}
                            </Link>

                            {childHasChildren && activeSubDropdown === child.label && (
                              <div className="absolute top-0 left-full ml-1 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[200px] py-1.5">
                                {child.children!.map((grandchild) => (
                                  <Link
                                    key={grandchild.href}
                                    href={grandchild.href}
                                    className="block px-4 py-2.5 text-[13px] text-gray-600 hover:text-[#0a3066] hover:bg-gray-50 transition-colors"
                                  >
                                    {grandchild.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3 ml-auto lg:ml-0 flex-shrink-0">
            {status === "authenticated" && session?.user ? (
              <div className="hidden sm:flex items-center gap-4">
                {session.user.role === "ADMIN" && (
                  <Link href="/admin/alumni" className="text-sm font-medium text-gray-700 hover:text-[#0a3066] transition-colors">
                    Admin Panel
                  </Link>
                )}
                {session.user.role === "USER" && (
                  <Link href="/alumni/apply" className="text-sm font-medium text-gray-700 hover:text-[#0a3066] transition-colors">
                    Apply for Membership
                  </Link>
                )}
                <span className="text-sm font-semibold text-[#0a3066] hidden sm:inline">{session.user.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className={buttonVariants({ variant: "secondary", size: "lg" })}
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            ) : (
              <Link href="/login" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "hidden sm:inline-flex")}>
                <LogIn className="h-4 w-4" /> Sign In
              </Link>
            )}

            <button
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden max-h-[80vh] overflow-y-auto border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-0.5">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href)
                const hasChildren = !!link.children?.length
                const expanded = mobileExpanded === link.label
                return (
                  <div key={link.href}>
                    <div className="flex items-center">
                      <Link
                        href={link.href}
                        className={cn(
                          "flex-1 flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                          active ? "text-[#0a3066] font-semibold bg-blue-50" : "text-gray-700 hover:bg-gray-50 hover:text-[#0a3066]"
                        )}
                      >
                        {link.label}
                      </Link>
                      {hasChildren && (
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600"
                          onClick={() => setMobileExpanded(expanded ? null : link.label)}
                        >
                          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                        </button>
                      )}
                    </div>
                    {hasChildren && expanded && (
                      <div className="pl-4 mt-0.5 space-y-0.5">
                        {link.children!.map((child) => {
                          const childHasChildren = !!child.children?.length
                          const subExpanded = mobileSubExpanded === child.label
                          return (
                            <div key={child.href}>
                              <div className="flex items-center">
                                <Link
                                  href={child.href}
                                  className="flex-1 block px-3 py-2 text-[13px] text-gray-500 hover:text-[#0a3066] hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  {child.label}
                                </Link>
                                {childHasChildren && (
                                  <button
                                    className="p-2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setMobileSubExpanded(subExpanded ? null : child.label)}
                                  >
                                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", subExpanded && "rotate-180")} />
                                  </button>
                                )}
                              </div>
                              {childHasChildren && subExpanded && (
                                <div className="pl-4 mt-0.5 space-y-0.5">
                                  {child.children!.map((grandchild) => (
                                    <Link
                                      key={grandchild.href}
                                      href={grandchild.href}
                                      className="block px-3 py-2 text-[12.5px] text-gray-500 hover:text-[#0a3066] hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                      {grandchild.label}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="px-4 py-3 border-t border-gray-200 space-y-2">
              {status === "authenticated" && session?.user ? (
                <>
                  <div className="px-3 py-2 text-sm font-semibold text-[#0a3066]">{session.user.name}</div>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin/alumni"
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  {session.user.role === "USER" && (
                    <Link
                      href="/alumni/apply"
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Apply for Membership
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </>
              ) : (
                <Link href="/login" className={cn(buttonVariants({ variant: "secondary", size: "xl" }), "w-full")}>
                  <LogIn className="h-4 w-4" /> Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  )
}
