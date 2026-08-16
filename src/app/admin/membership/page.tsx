"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { AdminShell } from "@/components/layout/admin-shell"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { adminNavGroups } from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormGroup } from "@/components/forms/form-group"
import {
  ApiError,
  getMembershipPlans,
  runMembershipExpiryCheck,
  updateMembershipPlan,
  type MembershipPlan,
} from "@/lib/api"

function PlanEditor({ token, plan, onSaved }: { token: string; plan: MembershipPlan; onSaved: () => void }) {
  const [displayName, setDisplayName] = useState(plan.displayName)
  const [priceBdt, setPriceBdt] = useState(String(plan.priceBdt))
  const [priceUsd, setPriceUsd] = useState(String(plan.priceUsd))
  const [discountPercent, setDiscountPercent] = useState(String(plan.discountPercent))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    setError("")
    setSuccess(false)
    setIsSaving(true)
    try {
      await updateMembershipPlan(token, plan.tier, {
        displayName,
        priceBdt: Number(priceBdt),
        priceUsd: Number(priceUsd),
        discountPercent: Number(discountPercent),
      })
      onSaved()
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save plan.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-[26px]">
      <h3 className="font-heading text-[18px] text-navy mb-5">{plan.tier}</h3>
      {error && <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>}
      {success && (
        <p className="text-[13px] text-success-text bg-success-bg rounded-lg px-3.5 py-2.5 mb-4">Saved.</p>
      )}
      <FormGroup label="Display Name">
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </FormGroup>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="Price (BDT / yr)">
          <Input type="number" min={0} value={priceBdt} onChange={(e) => setPriceBdt(e.target.value)} />
        </FormGroup>
        <FormGroup label="Price (USD / yr)">
          <Input type="number" min={0} value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} />
        </FormGroup>
      </div>
      <FormGroup label="Discount % on paid content" hint="Applied automatically when this tier's members access paid content.">
        <Input type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
      </FormGroup>
      <Button disabled={isSaving} onClick={handleSave} className="w-full">
        {isSaving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  )
}

export default function AdminMembershipPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [expiryResult, setExpiryResult] = useState<{ remindersSent: number; downgraded: number } | null>(null)
  const [expiryRunning, setExpiryRunning] = useState(false)
  const [expiryError, setExpiryError] = useState("")

  const loadPlans = useCallback(() => {
    setLoading(true)
    getMembershipPlans()
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timeout = setTimeout(loadPlans, 0)
    return () => clearTimeout(timeout)
  }, [loadPlans])

  async function handleRunExpiryCheck() {
    if (!token) return
    setExpiryError("")
    setExpiryResult(null)
    setExpiryRunning(true)
    try {
      setExpiryResult(await runMembershipExpiryCheck(token))
    } catch (err) {
      setExpiryError(err instanceof ApiError ? err.message : "Failed to run expiry check.")
    } finally {
      setExpiryRunning(false)
    }
  }

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Membership Tiers" />}>
        <Topbar title="Membership Tiers" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Membership Tiers" />}>
      <Topbar
        title="Membership Tiers"
        actions={
          <>
            {session?.user?.name && (
              <span className="text-[13px] text-muted-foreground hidden sm:inline">{session.user.name}</span>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-navy text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-lg hover:bg-navy/90 transition-colors"
            >
              View Live Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-1.5 border border-border text-[13px] font-semibold px-[18px] py-[10px] rounded-lg hover:bg-muted transition-colors"
            >
              Sign out
            </button>
          </>
        }
      />

      <div className="p-8 flex-1">
        <p className="text-[13px] text-muted-foreground mb-6 max-w-[640px]">
          Changes here apply immediately across the site — the public{" "}
          <Link href="/membership" className="text-gold font-semibold hover:underline">
            plan comparison page
          </Link>{" "}
          and the discount engine both read these values live.
        </p>

        {loading ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 max-w-[980px]">
            {plans.map((plan) => (
              <PlanEditor key={plan.tier} token={token} plan={plan} onSaved={loadPlans} />
            ))}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-[26px] max-w-[500px]">
          <h3 className="font-heading text-[18px] text-navy mb-1">Membership Expiry Check</h3>
          <p className="text-[13px] text-muted-foreground mb-5">
            Sends renewal reminders to Premium members expiring within 7 days, and downgrades already-expired
            members to General. Not yet on an automatic schedule — run manually until real paid subscriptions
            exist.
          </p>
          {expiryError && (
            <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{expiryError}</p>
          )}
          {expiryResult && (
            <p className="text-[13px] text-success-text bg-success-bg rounded-lg px-3.5 py-2.5 mb-4">
              Sent {expiryResult.remindersSent} reminder(s), downgraded {expiryResult.downgraded} expired member(s).
            </p>
          )}
          <Button disabled={expiryRunning} onClick={handleRunExpiryCheck}>
            {expiryRunning ? "Running…" : "Run Expiry Check Now"}
          </Button>
        </div>
      </div>
    </AdminShell>
  )
}
