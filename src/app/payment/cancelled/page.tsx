"use client"

import Link from "next/link"
import { CircleSlash } from "lucide-react"
import { AuthLayout } from "@/components/layout/auth-layout"

function LeftPanel() {
  return (
    <div className="text-white max-w-sm">
      <span className="text-eyebrow block mb-5" style={{ color: "var(--gold-light)" }}>
        Payment Cancelled
      </span>
      <h2 className="font-heading text-[34px] leading-[1.2] text-white mb-4">
        No worries
      </h2>
      <p className="text-white/60 text-[15px] leading-relaxed">
        You cancelled the payment before it completed. No charge was made.
      </p>
    </div>
  )
}

export default function PaymentCancelledPage() {
  return (
    <AuthLayout leftContent={<LeftPanel />}>
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "var(--bg-soft)" }}
        >
          <CircleSlash className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-[28px] text-navy mb-3">Payment cancelled</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-[320px] mx-auto">
          You cancelled before completing the payment. No charge was made — you can try again anytime.
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
