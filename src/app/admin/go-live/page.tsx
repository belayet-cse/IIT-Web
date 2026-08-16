"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { AdminShell } from "@/components/layout/admin-shell"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { AdminTabs } from "@/components/admin/admin-tabs"
import { adminNavGroups } from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ApiError,
  confirmAlumniCsv,
  confirmGoLive,
  previewAlumniCsv,
  previewGoLive,
  type AlumniCsvPreview,
  type GoLivePreview,
} from "@/lib/api"

function CountList({ label, emails, tone = "default" }: { label: string; emails: string[]; tone?: "default" | "warn" }) {
  if (emails.length === 0) return null
  return (
    <details className="border border-border rounded-lg px-4 py-3">
      <summary className={`text-[13px] font-semibold cursor-pointer ${tone === "warn" ? "text-destructive" : "text-navy"}`}>
        {label} ({emails.length})
      </summary>
      <ul className="mt-2 text-[12px] text-muted-foreground space-y-0.5 max-h-[160px] overflow-y-auto">
        {emails.map((email) => (
          <li key={email}>{email}</li>
        ))}
      </ul>
    </details>
  )
}

function AlumniVerificationTab({ token }: { token: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<AlumniCsvPreview | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [result, setResult] = useState<{ activated: number; notified: number } | null>(null)
  const [error, setError] = useState("")

  async function handlePreview() {
    if (!file) return
    setError("")
    setResult(null)
    setIsPreviewing(true)
    try {
      setPreview(await previewAlumniCsv(token, file))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to preview CSV.")
    } finally {
      setIsPreviewing(false)
    }
  }

  async function handleConfirm() {
    if (!preview) return
    if (
      !window.confirm(
        `Activate ALUMNI role for ${preview.matchedEmails.length} user(s) and notify ${preview.pendingNotMatchedEmails.length} pending user(s)?`
      )
    ) {
      return
    }
    setError("")
    setIsConfirming(true)
    try {
      const res = await confirmAlumniCsv(token, {
        matchedEmails: preview.matchedEmails,
        pendingNotMatchedEmails: preview.pendingNotMatchedEmails,
      })
      setResult(res)
      setPreview(null)
      setFile(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to activate alumni.")
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div className="max-w-[640px]">
      <p className="text-[13px] text-muted-foreground mb-5">
        Upload a CSV or text file of verified alumni emails (one per line, or email in the first column).
        Matched users are activated as Alumni; pending applicants not found in the file are notified they
        weren&apos;t matched this round.
      </p>

      <div className="flex gap-2 mb-5">
        <Input type="file" accept=".csv,.txt" className="py-2" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <Button disabled={!file || isPreviewing} onClick={handlePreview}>
          {isPreviewing ? "Reading…" : "Preview"}
        </Button>
      </div>

      {error && <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>}

      {result && (
        <p className="text-[13px] text-success-text bg-success-bg rounded-lg px-3.5 py-2.5 mb-4">
          Activated {result.activated} user(s), notified {result.notified} pending user(s).
        </p>
      )}

      {preview && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <CountList label="Will be activated as Alumni" emails={preview.matchedEmails} />
          <CountList label="Already Alumni" emails={preview.alreadyAlumniEmails} />
          <CountList label="No registered account (unmatched)" emails={preview.unmatchedEmails} />
          <CountList label="Skipped — Admin/Researcher accounts" emails={preview.skippedPrivilegedEmails} tone="warn" />
          <CountList label="Pending applicants not in this file (will be notified)" emails={preview.pendingNotMatchedEmails} tone="warn" />

          <Button disabled={isConfirming} onClick={handleConfirm} className="w-full">
            {isConfirming ? "Activating…" : "Confirm & Activate"}
          </Button>
        </div>
      )}
    </div>
  )
}

function GoLiveTab({ token }: { token: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<GoLivePreview | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null)
  const [error, setError] = useState("")

  async function handlePreview() {
    if (!file) return
    setError("")
    setResult(null)
    setIsPreviewing(true)
    try {
      setPreview(await previewGoLive(token, file))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to preview CSV.")
    } finally {
      setIsPreviewing(false)
    }
  }

  async function handleConfirm() {
    if (!preview) return
    if (
      !window.confirm(
        `Create ${preview.newEntries.length} new account(s) and email each a unique temporary password?`
      )
    ) {
      return
    }
    setError("")
    setIsConfirming(true)
    try {
      const res = await confirmGoLive(token, preview.newEntries)
      setResult(res)
      setPreview(null)
      setFile(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create accounts.")
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div className="max-w-[640px]">
      <p className="text-[13px] text-muted-foreground mb-5">
        Upload a CSV of <code>name,email</code> rows for the bulk go-live rollout. Each new account gets a
        unique random temporary password (never shared) and is required to set their own password on
        first login.
      </p>

      <div className="flex gap-2 mb-5">
        <Input type="file" accept=".csv,.txt" className="py-2" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <Button disabled={!file || isPreviewing} onClick={handlePreview}>
          {isPreviewing ? "Reading…" : "Preview"}
        </Button>
      </div>

      {error && <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>}

      {result && (
        <p className="text-[13px] text-success-text bg-success-bg rounded-lg px-3.5 py-2.5 mb-4">
          Created {result.created} account(s), skipped {result.skipped} that already existed.
        </p>
      )}

      {preview && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <CountList label="New accounts to create" emails={preview.newEntries.map((e) => `${e.name} <${e.email}>`)} />
          <CountList label="Already have accounts (skipped)" emails={preview.alreadyExistsEmails} tone="warn" />

          <Button disabled={isConfirming} onClick={handleConfirm} className="w-full">
            {isConfirming ? "Creating…" : "Confirm & Send Welcome Emails"}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function AdminGoLivePage() {
  const { data: session } = useSession()
  const token = session?.accessToken
  const [tab, setTab] = useState<"alumni" | "golive">("alumni")

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Go-Live Tools" />}>
        <Topbar title="Go-Live Tools" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Go-Live Tools" />}>
      <Topbar
        title="Go-Live Tools"
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
        <AdminTabs
          tabs={[
            { id: "alumni", label: "Alumni Verification" },
            { id: "golive", label: "Bulk Go-Live Rollout" },
          ]}
          activeTab={tab}
          onTabChange={(id) => setTab(id as "alumni" | "golive")}
        />

        {tab === "alumni" ? <AlumniVerificationTab token={token} /> : <GoLiveTab token={token} />}
      </div>
    </AdminShell>
  )
}
