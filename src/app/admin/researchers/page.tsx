"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { AdminShell } from "@/components/layout/admin-shell"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { DataTable } from "@/components/admin/data-table"
import { adminNavGroups } from "@/components/admin/admin-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ApiError,
  approveResearcherApplication,
  getResearcherApplications,
  rejectResearcherApplication,
  type ApplicationStatus,
  type ResearcherApplicationRow,
} from "@/lib/api"

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const variant = status === "APPROVED" ? "verified" : status === "REJECTED" ? "error" : "pending"
  return <Badge variant={variant}>{status === "PENDING" ? "Pending" : status === "APPROVED" ? "Approved" : "Rejected"}</Badge>
}

function RejectModal({
  row,
  token,
  onClose,
  onDone,
}: {
  row: ResearcherApplicationRow
  token: string
  onClose: () => void
  onDone: () => void
}) {
  const [reviewNote, setReviewNote] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleReject() {
    setIsSaving(true)
    setError("")
    try {
      await rejectResearcherApplication(token, row.id, reviewNote || undefined)
      onDone()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reject application.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl p-[26px] w-full max-w-[440px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading text-[19px] text-navy mb-4">Reject {row.name}&apos;s application</h3>
        {error && (
          <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>
        )}
        <Textarea
          rows={3}
          placeholder="Optional note for the applicant…"
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          className="mb-4"
        />
        <div className="flex gap-2">
          <Button className="flex-1" variant="destructive" disabled={isSaving} onClick={handleReject}>
            {isSaving ? "Rejecting…" : "Reject Application"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminResearchersPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [status, setStatus] = useState<ApplicationStatus | "">("PENDING")
  const [rows, setRows] = useState<ResearcherApplicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectingRow, setRejectingRow] = useState<ResearcherApplicationRow | null>(null)
  const [error, setError] = useState("")

  const loadRows = useCallback(() => {
    if (!token) return
    setLoading(true)
    getResearcherApplications(token, status || undefined)
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, status])

  useEffect(() => {
    const timeout = setTimeout(loadRows, 0)
    return () => clearTimeout(timeout)
  }, [loadRows])

  async function handleApprove(row: ResearcherApplicationRow) {
    if (!token) return
    setBusyId(row.id)
    setError("")
    try {
      await approveResearcherApplication(token, row.id)
      loadRows()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to approve application.")
    } finally {
      setBusyId(null)
    }
  }

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Researchers" />}>
        <Topbar title="Researchers" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Researchers" />}>
      <Topbar
        title="Researcher Applications"
        actions={
          <>
            {session?.user?.name && (
              <span className="text-[13px] text-muted-foreground hidden sm:inline">{session.user.name}</span>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-navy text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-sm hover:bg-navy/90 transition-colors"
            >
              View Live Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-1.5 border border-border text-[13px] font-semibold px-[18px] py-[10px] rounded-sm hover:bg-muted transition-colors"
            >
              Sign out
            </button>
          </>
        }
      />

      <div className="p-8 flex-1">
        <div className="flex justify-between items-center mb-4">
          <Select className="w-[180px]" value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus | "")}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>
        </div>

        {error && (
          <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
        ) : (
          <DataTable<ResearcherApplicationRow>
            emptyMessage="No applications found."
            columns={[
              {
                key: "applicant",
                header: "Applicant",
                render: (row) => (
                  <div>
                    <div className="font-semibold text-navy text-[13px]">{row.name}</div>
                    <div className="text-[11.5px] text-muted-foreground">{row.email}</div>
                  </div>
                ),
              },
              { key: "organization", header: "Organization" },
              { key: "currentRole", header: "Role" },
              {
                key: "expertiseAreas",
                header: "Expertise",
                render: (row) => row.expertiseAreas.join(", ") || "—",
              },
              { key: "applied", header: "Applied" },
              { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
              {
                key: "actions",
                header: "Actions",
                render: (row) =>
                  row.status === "PENDING" ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" disabled={busyId === row.id} onClick={() => handleApprove(row)}>
                        Approve
                      </Button>
                      <button
                        disabled={busyId === row.id}
                        onClick={() => setRejectingRow(row)}
                        className="inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-semibold border text-red-700 border-red-200 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  ),
              },
            ]}
            data={rows}
          />
        )}
      </div>

      {rejectingRow && (
        <RejectModal token={token} row={rejectingRow} onClose={() => setRejectingRow(null)} onDone={loadRows} />
      )}
    </AdminShell>
  )
}
