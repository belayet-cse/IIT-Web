"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Lock, ArrowLeft, Send } from "lucide-react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { forgotPassword } from "@/lib/api"

// ── Left panel ────────────────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div className="text-white max-w-sm">
      <span className="text-eyebrow block mb-5" style={{ color: "var(--gold-light)" }}>
        Account Recovery
      </span>
      <h2 className="font-heading text-[34px] leading-[1.2] text-white mb-4">
        Let's get you back in
      </h2>
      <p className="text-white/60 text-[15px] leading-relaxed mb-10">
        Enter your registered email and we'll send a secure link to reset your password. The link
        expires in 24 hours.
      </p>

      <div className="space-y-4">
        {[
          { icon: <Send className="w-4 h-4" style={{ color: "var(--gold)" }} />, text: "Reset link sent to your inbox" },
          { icon: <Lock className="w-4 h-4" style={{ color: "var(--gold)" }} />, text: "Expires automatically after 24 hours" },
          { icon: <Mail className="w-4 h-4" style={{ color: "var(--gold)" }} />, text: "Check your spam folder if not received" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(245,158,11,.12)" }}
            >
              {item.icon}
            </div>
            <span className="text-white/60 text-[13px]">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Success state ─────────────────────────────────────────────────────────────

function SuccessView({ email }: { email: string }) {
  return (
    <div>
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: "var(--success-bg)" }}
      >
        <Mail className="w-7 h-7" style={{ color: "var(--success-text)" }} />
      </div>
      <h2 className="font-heading text-[28px] text-navy mb-3 text-center">Check your inbox</h2>
      <p className="text-sm text-muted-foreground text-center mb-2 max-w-[360px] mx-auto">
        We've sent a password reset link to
      </p>
      <p className="text-[14px] font-semibold text-navy text-center mb-8">{email}</p>

      <div
        className="rounded-xl p-4 mb-8 text-[12.5px] text-muted-foreground leading-relaxed"
        style={{ backgroundColor: "var(--bg-soft)", border: "1px solid var(--border-line)" }}
      >
        The link will expire in <strong className="text-navy">24 hours</strong>. If you don't see
        the email, check your <strong className="text-navy">spam or junk folder</strong>.
      </div>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-lg py-3 text-[14px] font-semibold hover:bg-primary/90 transition-opacity"
      >
        Back to sign in
      </Link>

      <p className="text-center text-[12px] text-muted-foreground mt-5">
        Wrong email?{" "}
        <Link
          href="/forgot-password"
          className="text-gold hover:underline underline-offset-2"
        >
          Try a different address
        </Link>
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError("Email is required.")
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address.")
      return
    }
    setError("")
    setIsLoading(true)
    try {
      await forgotPassword(email)
      setSubmitted(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout leftContent={<LeftPanel />}>
      {submitted ? (
        <SuccessView email={email} />
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
            Forgot your password?
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            No problem. Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">

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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                  />
                </div>
                {error && (
                  <p className="text-[12px] text-destructive mt-1.5">{error}</p>
                )}
                <p className="text-[12px] text-muted-foreground mt-1.5">
                  We'll send a reset link to this address if it's registered with IIT.
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full py-3 text-[14px] font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Sending link…" : "Send reset link →"}
              </Button>
            </div>
          </form>

          <p className="text-center text-[12px] text-muted-foreground mt-7">
            Remembered it?{" "}
            <Link href="/login" className="text-gold font-semibold hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  )
}
