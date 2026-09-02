"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, ShieldCheck, ArrowLeft } from "lucide-react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ApiError, resetPassword } from "@/lib/api"

// ── Left panel ────────────────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div className="text-white max-w-sm">
      <span className="text-eyebrow block mb-5" style={{ color: "var(--gold-light)" }}>
        Secure Reset
      </span>
      <h2 className="font-heading text-[34px] leading-[1.2] text-white mb-4">
        Create a strong new password
      </h2>
      <p className="text-white/60 text-[15px] leading-relaxed mb-10">
        Choose a password you haven't used before. A strong password makes your account much harder
        to compromise.
      </p>

      {/* Tips */}
      <div className="space-y-3">
        <p
          className="text-[11px] uppercase tracking-[0.08em] font-bold mb-3"
          style={{ color: "var(--gold)" }}
        >
          Password tips
        </p>
        {[
          "At least 8 characters long",
          "Mix of uppercase and lowercase letters",
          "Include numbers and special characters",
          "Avoid names, birthdays, or dictionary words",
        ].map((tip) => (
          <div key={tip} className="flex items-start gap-2.5">
            <div
              className="w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0"
              style={{ backgroundColor: "var(--gold)" }}
            />
            <span className="text-white/60 text-[13px]">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Password strength ─────────────────────────────────────────────────────────

function getStrength(pw: string): { bars: number; label: string; color: string } {
  if (!pw) return { bars: 0, label: "", color: "" }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const bars = Math.min(4, Math.max(1, score))
  const map = [
    { label: "Too short", color: "var(--destructive)" },
    { label: "Weak", color: "var(--destructive)" },
    { label: "Fair", color: "var(--warning-text)" },
    { label: "Good", color: "var(--success-text)" },
    { label: "Strong", color: "var(--navy)" },
  ]
  return { bars, ...map[bars] }
}

// ── Success state ─────────────────────────────────────────────────────────────

function SuccessView() {
  return (
    <div className="text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: "var(--success-bg)" }}
      >
        <ShieldCheck className="w-8 h-8" style={{ color: "var(--success-text)" }} />
      </div>
      <h2 className="font-heading text-[28px] text-navy mb-3">Password updated!</h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-[320px] mx-auto">
        Your password has been reset successfully. You can now sign in with your new password.
      </p>
      <Link
        href="/login"
        className="flex items-center justify-center w-full bg-primary text-primary-foreground rounded-sm py-3 text-[14px] font-semibold hover:bg-primary/90 transition-opacity"
      >
        Sign in to your account →
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface FormErrors {
  password?: string
  confirmPassword?: string
}

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState("")

  const strength = getStrength(password)

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!password) {
      errs.password = "New password is required."
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters."
    }
    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your new password."
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match."
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    if (!token) return
    setFormError("")
    setIsLoading(true)
    try {
      await resetPassword({ token, password })
      setSuccess(true)
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Invalid / missing token
  if (!token) {
    return (
      <AuthLayout leftContent={<LeftPanel />}>
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "var(--error-bg)" }}
          >
            <Lock className="w-7 h-7 text-destructive" />
          </div>
          <h2 className="font-heading text-[26px] text-navy mb-3">Invalid reset link</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-[320px] mx-auto">
            This link is invalid or has expired. Reset links are only valid for 24 hours.
          </p>
          <Link
            href="/forgot-password"
            className="flex items-center justify-center w-full bg-primary text-primary-foreground rounded-sm py-3 text-[14px] font-semibold hover:bg-primary/90 transition-opacity"
          >
            Request a new link
          </Link>
          <p className="text-center text-[12px] text-muted-foreground mt-5">
            <Link href="/login" className="text-navy font-semibold hover:underline underline-offset-2">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout leftContent={<LeftPanel />}>
      {success ? (
        <SuccessView />
      ) : (
        <div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>

          <h1 className="font-heading text-[30px] text-navy leading-tight mb-1.5">
            Set a new password
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Your new password must be different from any you've used before.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">

              {formError && (
                <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5">
                  {formError}
                </p>
              )}

              {/* New password */}
              <div>
                <Label htmlFor="password" required>New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    className="pl-10 pr-11"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors((prev) => ({ ...prev, password: undefined }))
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength bars */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor:
                              i <= strength.bars ? strength.color : "var(--border)",
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[11.5px] mt-1 font-medium" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-[12px] text-destructive mt-1.5">{errors.password}</p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <Label htmlFor="confirm-password" required>Confirm new password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your new password"
                    className="pl-10 pr-11"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[12px] text-destructive mt-1.5">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full py-3 text-[14px] font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Saving password…" : "Save new password →"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout leftContent={<LeftPanel />}>
          <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
