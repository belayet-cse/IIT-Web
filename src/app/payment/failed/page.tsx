"use client"

import Link from "next/link"
import { XCircle } from "lucide-react"
import { AuthLayout } from "@/components/layout/auth-layout"

function LeftPanel() {
  return (
    <div className="text-white max-w-sm">
      <span className="text-eyebrow block mb-5" style={{ color: "var(--gold-light)" }}>
        Payment Issue
      </span>
      <h2 className="font-heading text-[34px] leading-[1.2] text-white mb-4">
        Something went wrong
      </h2>
      <p className="text-white/60 text-[15px] leading-relaxed">
        Your card or bank may have declined the transaction, or the payment session timed out. No
        charge was made.
      </p>
    </div>
  )
}

export default function PaymentFailedPage() {
  return (
    <AuthLayout leftContent={<LeftPanel />}>
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "var(--error-bg)" }}
        >
          <XCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="font-heading text-[28px] text-navy mb-3">Payment failed</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-[320px] mx-auto">
          We weren&apos;t able to complete this payment. No charge was made — you can try again anytime.
        </p>
        <Link
          href="/"
          className="flex items-center justify-center w-full bg-primary text-primary-foreground rounded-sm py-3 text-[14px] font-semibold hover:bg-primary/90 transition-opacity"
        >
          Back to IITrade
        </Link>
      </div>
    </AuthLayout>
  )
}
