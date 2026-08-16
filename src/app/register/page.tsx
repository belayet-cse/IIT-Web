"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Check, CheckCircle } from "lucide-react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ApiError,
  getMembershipPlans,
  registerUser,
  type MembershipPlan,
  type MembershipTier,
  type RegistrationType,
} from "@/lib/api"

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
    { title: "Certification Discounts", desc: "Verified members save up to 20% on IITrade programs" },
    { title: "Exclusive Events", desc: "Invitations to reunions, webinars, and mentorship sessions" },
  ]
  return (
    <div className="text-white max-w-sm">
      <span className="text-eyebrow block mb-5" style={{ color: "var(--gold-light)" }}>
        Join IITrade
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

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS: { id: RegistrationType; label: string }[] = [
  { id: "GENERAL", label: "General Member" },
  { id: "PREMIUM", label: "Premium Member" },
  { id: "ALUMNI", label: "Alumni" },
]

function TabBar({ active, onChange }: { active: RegistrationType; onChange: (t: RegistrationType) => void }) {
  return (
    <div className="flex gap-1 mb-7 border-b border-border">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-2.5 text-[13px] font-semibold cursor-pointer border-b-2 border-transparent transition-colors",
            active === tab.id ? "text-navy" : "text-muted-foreground hover:text-foreground"
          )}
          style={active === tab.id ? { borderBottomColor: "var(--gold)" } : undefined}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ── Premium plan selector ────────────────────────────────────────────────────

function PlanSelector({
  plans,
  value,
  onChange,
}: {
  plans: MembershipPlan[]
  value: MembershipTier
  onChange: (t: MembershipTier) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-1">
      {plans.map((plan) => (
        <button
          key={plan.tier}
          type="button"
          onClick={() => onChange(plan.tier)}
          className={cn(
            "text-left border rounded-lg p-3.5 transition-colors",
            value === plan.tier ? "border-gold bg-gold/5" : "border-border hover:border-gold/40"
          )}
        >
          <div className="text-[13px] font-bold text-navy">{plan.displayName}</div>
          <div className="text-[12px] text-gold font-semibold mt-0.5">৳{plan.priceBdt.toLocaleString()}/yr</div>
          <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{plan.discountPercent}% member discount</div>
        </button>
      ))}
    </div>
  )
}

// ── Form ──────────────────────────────────────────────────────────────────────

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string
  organization: string
  password: string
  confirmPassword: string
  agreed: boolean
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  organization?: string
  password?: string
  confirmPassword?: string
  agreed?: string
}

const emptyForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organization: "",
  password: "",
  confirmPassword: "",
  agreed: false,
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.firstName.trim()) errors.firstName = "First name is required."
  if (!form.lastName.trim()) errors.lastName = "Last name is required."
  if (!form.email) {
    errors.email = "Email is required."
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = "Enter a valid email address."
  }
  if (!form.phone.trim()) errors.phone = "Phone number is required."
  if (!form.organization.trim()) errors.organization = "Organization is required."
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
  const [tab, setTab] = useState<RegistrationType>("GENERAL")
  const [membershipTier, setMembershipTier] = useState<MembershipTier>("BASIC")
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState("")

  useEffect(() => {
    getMembershipPlans().then(setPlans).catch(() => {})
  }, [])

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
      await registerUser({
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email,
        password: form.password,
        phone: form.phone,
        organization: form.organization,
        registrationType: tab,
        membershipTier: tab === "PREMIUM" ? membershipTier : undefined,
      })
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
          <p className="text-sm text-muted-foreground mb-8 max-w-[360px] mx-auto">
            {tab === "GENERAL" && (
              <>
                Your account is ready. Sign in with <strong className="text-navy">{form.email}</strong> to
                get started.
              </>
            )}
            {tab === "PREMIUM" && (
              <>
                You&apos;re signed up with General access for now. Premium checkout is launching soon —
                we&apos;ll email <strong className="text-navy">{form.email}</strong> to complete payment for the{" "}
                {plans.find((p) => p.tier === membershipTier)?.displayName ?? membershipTier} plan and activate your Premium benefits.
              </>
            )}
            {tab === "ALUMNI" && (
              <>
                Your alumni status is being verified against our records. You have General access in the
                meantime, and we&apos;ll email <strong className="text-navy">{form.email}</strong> once
                verification is complete.
              </>
            )}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full bg-primary text-primary-foreground rounded-lg py-3 text-[14px] font-semibold hover:bg-primary/90 transition-opacity"
          >
            Go to sign in →
          </Link>
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
        <p className="text-sm text-muted-foreground mb-6">
          Already have an account?{" "}
          <Link href="/login" className="text-gold font-semibold hover:underline underline-offset-2">
            Sign in
          </Link>
        </p>

        <TabBar active={tab} onChange={setTab} />

        {tab === "PREMIUM" && (
          <div className="mb-6">
            <Label>Choose a plan</Label>
            <PlanSelector plans={plans} value={membershipTier} onChange={setMembershipTier} />
          </div>
        )}

        {tab === "ALUMNI" && (
          <p className="text-[12.5px] text-muted-foreground bg-muted/60 rounded-lg px-3.5 py-2.5 mb-6">
            We&apos;ll check your email against our verified alumni records. You&apos;ll have General Member access
            immediately, upgraded automatically once verification is confirmed.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5">

            {formError && (
              <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5">
                {formError}
              </p>
            )}

            {/* First / Last name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" required>First name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                  <Input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Rafiq"
                    className="pl-10"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                  />
                </div>
                {errors.firstName && <p className="text-[12px] text-destructive mt-1.5">{errors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName" required>Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Ahmed"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
                {errors.lastName && <p className="text-[12px] text-destructive mt-1.5">{errors.lastName}</p>}
              </div>
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

            {/* Phone / Organization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" required>Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+880 1XXX-XXXXXX"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                {errors.phone && <p className="text-[12px] text-destructive mt-1.5">{errors.phone}</p>}
              </div>
              <div>
                <Label htmlFor="organization" required>Organization</Label>
                <Input
                  id="organization"
                  type="text"
                  placeholder="e.g. Standard Bank"
                  value={form.organization}
                  onChange={(e) => set("organization", e.target.value)}
                />
                {errors.organization && (
                  <p className="text-[12px] text-destructive mt-1.5">{errors.organization}</p>
                )}
              </div>
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
                  , and to receive account-related communications from IITrade.
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
            IITrade homepage
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
