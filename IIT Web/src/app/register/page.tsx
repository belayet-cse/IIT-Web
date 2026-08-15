"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Check, CheckCircle } from "lucide-react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ApiError, registerUser } from "@/lib/api"

// ── Password strength ─────────────────────────────────────────────────────────

function getStrength(password: string): { bars: number; label: string; color: string } {
  if (!password) return { bars: 0, label: "", color: "" }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
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

function StrengthBar({ password }: { password: string }) {
  const { bars, label, color } = getStrength(password)
  if (!password) return null
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= bars ? color : "var(--border)" }}
          />
        ))}
      </div>
      <p className="text-[11.5px] mt-1 font-medium" style={{ color }}>
        {label}
      </p>
    </div>
  )
}

// ── Left panel ────────────────────────────────────────────────────────────────

function LeftPanel() {
  const benefits = [
    { title: "Alumni Directory", desc: "Connect with 278 professionals across 18 countries" },
    { title: "Private Forum", desc: "Exchange insights and stay updated with certified peers" },
    { title: "Certification Discounts", desc: "Verified members save up to 20% on IIT programs" },
    { title: "Exclusive Events", desc: "Invitations to reunions, webinars, and mentorship sessions" },
  ]
  return (
    <div className="text-white max-w-sm">
      <span className="text-eyebrow block mb-5" style={{ color: "var(--gold-light)" }}>
        Join IIT
      </span>
      <h2 className="font-heading text-[34px] leading-[1.2] text-white mb-4">
        Be part of a global community
      </h2>
      <p className="text-white/60 text-[15px] leading-relaxed mb-10">
        Connect with certified professionals, access exclusive resources, and advance your career in
        trade finance.
      </p>
      <div className="space-y-5">
        {benefits.map((b) => (
          <div key={b.title} className="flex items-start gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: "rgba(201,168,76,.18)" }}
            >
              <Check className="w-3 h-3" style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <div className="text-white text-[13px] font-semibold">{b.title}</div>
              <div className="text-white/50 text-[12px] leading-relaxed">{b.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Form ──────────────────────────────────────────────────────────────────────

interface FormState {
  name: string
  email: string
  password: string
  confirmPassword: string
  agreed: boolean
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  agreed?: string
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.name.trim()) errors.name = "Full name is required."
  if (!form.email) {
    errors.email = "Email is required."
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Enter a valid email address."
  }
  if (!form.password) {
    errors.password = "Password is required."
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters."
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password."
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match."
  }
  if (!form.agreed) errors.agreed = "You must accept the terms to continue."
  return errors
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState("")

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setFormError("")
    setIsLoading(true)
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password })
      setSuccess(true)
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout leftContent={<LeftPanel />}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" style={{ color: "var(--success-text)" }} />
          </div>
          <h2 className="font-heading text-[28px] text-navy mb-3">Account created!</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-[340px] mx-auto">
            We've sent a verification email to{" "}
            <strong className="text-navy">{form.email}</strong>. Please check your inbox and
            verify your address to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground rounded-lg py-3 text-[14px] font-semibold hover:bg-primary/90 transition-opacity"
          >
            Go to sign in →
          </Link>
          <p className="text-[12px] text-muted-foreground mt-4">
            Didn't receive the email?{" "}
            <button
              className="text-gold hover:underline underline-offset-2"
              onClick={() => setSuccess(false)}
            >
              Try again
            </button>
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout leftContent={<LeftPanel />}>
      <div>
        <h1 className="font-heading text-[30px] text-navy leading-tight mb-1.5">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Already have an account?{" "}
          <Link href="/login" className="text-gold font-semibold hover:underline underline-offset-2">
            Sign in
          </Link>
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5">

            {formError && (
              <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5">
                {formError}
              </p>
            )}

            {/* Full name */}
            <div>
              <Label htmlFor="name" required>Full name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Rafiq Ahmed"
                  className="pl-10"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              {errors.name && (
                <p className="text-[12px] text-destructive mt-1.5">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" required>Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="pl-10"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              {errors.email && (
                <p className="text-[12px] text-destructive mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" required>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="pl-10 pr-11"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
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
              <StrengthBar password={form.password} />
              {errors.password && (
                <p className="text-[12px] text-destructive mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <Label htmlFor="confirm-password" required>Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className="pl-10 pr-11"
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
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
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-[12px] mt-1.5 flex items-center gap-1" style={{ color: "var(--success-text)" }}>
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
              {errors.confirmPassword && (
                <p className="text-[12px] text-destructive mt-1.5">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mt-[2px] w-3.5 h-3.5 accent-navy flex-shrink-0"
                  checked={form.agreed}
                  onChange={(e) => set("agreed", e.target.checked)}
                />
                <span className="text-[12.5px] text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-navy font-semibold hover:underline underline-offset-2">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-navy font-semibold hover:underline underline-offset-2">
                    Privacy Policy
                  </Link>
                  , and to receive account-related communications from IIT.
                </span>
              </label>
              {errors.agreed && (
                <p className="text-[12px] text-destructive mt-1.5">{errors.agreed}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full py-3 text-[14px] font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Creating account…" : "Create account →"}
            </Button>
          </div>
        </form>

        <p className="text-center text-[12px] text-muted-foreground mt-7">
          Back to{" "}
          <Link href="/" className="text-navy font-semibold hover:underline underline-offset-2">
            IIT homepage
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
