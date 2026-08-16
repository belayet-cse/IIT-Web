"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ApiError,
  expressMembershipInterest,
  getMembershipPlans,
  type MembershipPlan,
  type MembershipTier,
} from "@/lib/api"

const BLURBS: Record<MembershipTier, string[]> = {
  BASIC: ["Member discounts on paid content", "Alumni & member directory access", "Discussion forum access"],
  PRO: ["Everything in Basic", "Free certifications included", "Priority support"],
  ELITE: ["Everything in Pro", "Priority event access", "Highest discount tier"],
}

function PlanCard({
  plan,
  isCurrent,
  onChoose,
  isBusy,
}: {
  plan: MembershipPlan
  isCurrent: boolean
  onChoose: () => void
  isBusy: boolean
}) {
  return (
    <div
      className={cn(
        "bg-card border rounded-xl p-8 flex flex-col",
        plan.tier === "PRO" ? "border-gold shadow-lg" : "border-border"
      )}
    >
      {plan.tier === "PRO" && (
        <span className="text-[10px] uppercase tracking-wider font-bold text-gold mb-2">Most Popular</span>
      )}
      <h3 className="font-heading text-[22px] text-navy mb-1">{plan.displayName}</h3>
      <div className="text-[28px] font-bold text-navy mb-1">
        ৳{plan.priceBdt.toLocaleString()}
        <span className="text-[13px] font-normal text-muted-foreground">/yr</span>
      </div>
      <div className="text-[13px] text-muted-foreground mb-4">or ${plan.priceUsd}/yr</div>
      <div className="text-[12.5px] text-gold font-semibold mb-6">{plan.discountPercent}% member discount</div>
      <ul className="space-y-2.5 mb-8 flex-1">
        {BLURBS[plan.tier].map((b) => (
          <li key={b} className="flex items-start gap-2 text-[13px] text-muted-foreground">
            <span className="text-gold flex-shrink-0" aria-hidden>
              ✓
            </span>
            {b}
          </li>
        ))}
      </ul>
      <Button
        variant={plan.tier === "PRO" ? "default" : "outline"}
        disabled={isCurrent || isBusy}
        onClick={onChoose}
        className="w-full"
      >
        {isCurrent ? "Current Plan" : isBusy ? "Saving…" : "Choose This Plan"}
      </Button>
    </div>
  )
}

export default function MembershipPage() {
  const { data: session, status } = useSession()
  const token = session?.accessToken

  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [busyTier, setBusyTier] = useState<MembershipTier | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    getMembershipPlans()
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleChoose(tier: MembershipTier) {
    if (!token) return
    setError("")
    setMessage("")
    setBusyTier(tier)
    try {
      await expressMembershipInterest(token, tier)
      setMessage(
        `Thanks! We've recorded your interest in the ${tier.charAt(0) + tier.slice(1).toLowerCase()} plan — our team will follow up to complete payment and activate your Premium benefits.`
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setBusyTier(null)
    }
  }

  const currentTier = session?.user?.role === "PREMIUM" ? session.membershipTier : undefined

  return (
    <>
      <TopNav />
      <main className="pt-20">
        <section className="py-16 bg-background">
          <div className="max-w-[760px] mx-auto px-6 text-center">
            <h1 className="font-heading text-[34px] text-navy mb-4">Membership Plans</h1>
            <p className="text-base text-muted-foreground">
              Choose a Premium tier to unlock member discounts, the discussion forum, and more across
              IIT&apos;s programs and content.
            </p>
          </div>
        </section>

        <section className="py-16 bg-card">
          <div className="max-w-[1180px] mx-auto px-8">
            {status === "unauthenticated" && (
              <p className="text-center text-[13px] text-muted-foreground mb-8">
                <Link href="/register" className="text-gold font-semibold hover:underline">
                  Create an account
                </Link>{" "}
                to choose a plan, or{" "}
                <Link href="/login" className="text-gold font-semibold hover:underline">
                  sign in
                </Link>{" "}
                if you already have one.
              </p>
            )}
            {message && (
              <p className="text-[13px] text-success-text bg-success-bg rounded-lg px-3.5 py-2.5 mb-6 max-w-[640px] mx-auto text-center">
                {message}
              </p>
            )}
            {error && (
              <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-6 max-w-[640px] mx-auto text-center">
                {error}
              </p>
            )}

            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-10">Loading…</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[980px] mx-auto">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.tier}
                    plan={plan}
                    isCurrent={currentTier === plan.tier}
                    isBusy={busyTier === plan.tier}
                    onChoose={() => (token ? handleChoose(plan.tier) : undefined)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
