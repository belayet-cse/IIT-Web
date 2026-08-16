"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Lock, ShieldAlert } from "lucide-react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ApiError, changeMyPassword } from "@/lib/api"

function LeftPanel() {
  return (
    <div className="text-white max-w-sm">
      <span className="text-eyebrow block mb-5" style={{ color: "var(--gold-light)" }}>
        Account Security
      </span>
      <h2 className="font-heading text-[34px] leading-[1.2] text-white mb-4">
        Set your own password
      </h2>
      <p className="text-white/60 text-[15px] leading-relaxed">
        You&apos;re currently signed in with a temporary password. Choose a new one to finish securing your
        account and continue to IITrade.
      </p>
    </div>
  )
}

export default function ChangePasswordPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const token = session?.accessToken

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!currentPassword || !newPassword) {
      setError("Please fill in both password fields.")
      return
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.")
      return
    }
    if (!token) {
      setError("Your session has expired. Please sign in again.")
      return
    }
    setIsSaving(true)
    try {
      await changeMyPassword(token, { currentPassword, newPassword })
      await update({ mustChangePassword: false })
      router.push(session?.user?.role === "ADMIN" ? "/admin/alumni" : "/alumni")
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to change password.")
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <AuthLayout leftContent={<LeftPanel />}>
        <p className="text-sm text-muted-foreground text-center">Loading…</p>
      </AuthLayout>
    )
  }

  if (status !== "authenticated") {
    return (
      <AuthLayout leftContent={<LeftPanel />}>
        <p className="text-sm text-muted-foreground text-center">Please sign in to continue.</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout leftContent={<LeftPanel />}>
      <div>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-gold bg-gold/10 rounded-lg px-3.5 py-2.5 mb-6">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          Password change required before you continue
        </div>

        <h1 className="font-heading text-[28px] text-navy leading-tight mb-1.5">Change your password</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Enter the temporary password you were given, then choose a new one.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5">
            {error && (
              <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5">{error}</p>
            )}

            <div>
              <Label htmlFor="currentPassword" required>Temporary password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  className="pl-10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword" required>New password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="pl-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" required>Confirm new password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3 text-[14px] font-semibold" disabled={isSaving}>
              {isSaving ? "Updating…" : "Set new password →"}
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
