"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSession, signIn } from "next-auth/react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

// ── Left panel content ────────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div className="text-white max-w-sm">
      <span className="text-eyebrow block mb-5" style={{ color: "var(--gold-light)" }}>
        Welcome back
      </span>
      <h2 className="font-heading text-[34px] leading-[1.2] text-white mb-4">
        Your trade finance community awaits
      </h2>
      <p className="text-white/60 text-[15px] leading-relaxed mb-10">
        Sign in to access the alumni directory, private forum, and exclusive certification discounts.
      </p>

      {/* Testimonial */}
      <div className="border-l-[3px] pl-5" style={{ borderColor: "var(--gold)" }}>
        <p className="text-white/75 text-[13.5px] italic leading-relaxed mb-4">
          "The alumni network opened doors I didn't know existed. Worth every moment of the
          certification journey."
        </p>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: "var(--navy-surface)" }}
          >
            RA
          </div>
          <div>
            <div className="text-white text-[13px] font-semibold">Rafiq Ahmed</div>
            <div className="text-white/45 text-[11px]">Trade Finance Manager · Standard Bank</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Form ──────────────────────────────────────────────────────────────────────

interface FormState {
  email: string
  password: string
  rememberMe: boolean
}

interface FormErrors {
  email?: string
  password?: string
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.email) {
    errors.email = "Email is required."
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Enter a valid email address."
  }
  if (!form.password) {
    errors.password = "Password is required."
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters."
  }
  return errors
}

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ email: "", password: "", rememberMe: false })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")

  function set(field: keyof FormState, value: string | boolean) {
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
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    setIsLoading(false)
    if (result?.error) {
      setFormError("Invalid email or password.")
      return
    }
    const session = await getSession()
    router.push(session?.user?.role === "ADMIN" ? "/admin/alumni" : "/alumni")
    router.refresh()
  }

  return (
    <AuthLayout leftContent={<LeftPanel />}>
      <div>
        <h1 className="font-heading text-[30px] text-navy leading-tight mb-1.5">Sign in</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Welcome back. Enter your credentials to continue.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5">

            {formError && (
              <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5">
                {formError}
              </p>
            )}

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
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-[12px] text-destructive mt-1.5">
                  {errors.email}
                </p>
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
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="pl-10 pr-11"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  aria-describedby={errors.password ? "password-error" : undefined}
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
              {errors.password && (
                <p id="password-error" className="text-[12px] text-destructive mt-1.5">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[13px] text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 accent-navy rounded"
                  checked={form.rememberMe}
                  onChange={(e) => set("rememberMe", e.target.checked)}
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-[13px] text-gold hover:underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full py-3 text-[14px] font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : "Sign in →"}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-[12px] text-muted-foreground">
                New to IIT?
              </span>
            </div>
          </div>

          {/* Apply link */}
          <Link
            href="/alumni/apply"
            className="flex items-center justify-center w-full border border-border rounded-lg py-3 text-[13.5px] font-semibold text-navy hover:bg-muted/60 transition-colors"
          >
            Apply for Alumni Membership
          </Link>
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
