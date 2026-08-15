"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface UserMenuProps {
  name: string
  isAdmin: boolean
  className?: string
}

export function UserMenu({ name, isAdmin, className }: UserMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-muted transition-colors"
      >
        <Avatar initials={initialsFrom(name)} size="sm" />
        <span className="text-nav text-navy font-semibold hidden sm:inline">{name}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-2 z-50">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-[13.5px] text-foreground hover:bg-muted transition-colors"
            >
              Profile
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-[13.5px] text-foreground hover:bg-muted transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
            <div className="my-1.5 border-t border-border" />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-[13.5px] text-destructive hover:bg-destructive/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  )
}
