"use client"

import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { AuthLayout } from "@/components/layout/auth-layout"

function LeftPanel() {
  return (
    <div className="text-white max-w-sm">
      <span className="text-eyebrow block mb-5" style={{ color: "var(--gold-light)" }}>
        Payment Confirmed
      </span>
      <h2 className="font-heading text-[34px] leading-[1.2] text-white mb-4">
        Thanks for your payment
      </h2>
      <p className="text-white/60 text-[15px] leading-relaxed">
        Your purchase has been confirmed and your access has been activated automatically.
      </p>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <AuthLayout leftContent={<LeftPanel />}>
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "var(--success-bg)" }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: "var(--success-text)" }} />
        </div>
        <h1 className="font-heading text-[28px] text-navy mb-3">Payment successful</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-[320px] mx-auto">
          Your payment has cleared and access has been unlocked. A confirmation email is on its way.
        </p>
        <Link
          href="/"
          className="flex items-center justify-center w-full bg-primary text-primary-foreground rounded-lg py-3 text-[14px] font-semibold hover:bg-primary/90 transition-opacity"
        >
          Back to IITrade
        </Link>
      </div>
    </AuthLayout>
  )
}
