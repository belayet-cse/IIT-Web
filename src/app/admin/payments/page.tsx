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
import { ApiError, getAdminPayments, markPaymentPaid, type AdminPaymentRow, type PaymentStatus } from "@/lib/api"

function StatusBadge({ status }: { status: PaymentStatus }) {
  const variant = status === "SUCCESS" ? "verified" : status === "PENDING" ? "pending" : "error"
  const label = status.charAt(0) + status.slice(1).toLowerCase()
  return <Badge variant={variant}>{label}</Badge>
}

function formatAmount(row: AdminPaymentRow) {
  const symbol = row.currency === "BDT" ? "৳" : "$"
  if (row.discountPercent > 0) {
    const finalAmount = Math.round(row.amount * (1 - row.discountPercent / 100))
    return `${symbol}${finalAmount.toLocaleString()} (${row.discountPercent}% off ${symbol}${row.amount.toLocaleString()})`
  }
  return `${symbol}${row.amount.toLocaleString()}`
}

function describeItem(row: AdminPaymentRow) {
  if (row.type === "BLOG") return row.blogTitle ?? "Blog post"
  if (row.type === "RESEARCH") return row.paperTitle ?? "Research paper"
  return row.membershipTier
}

function MarkPaidModal({
  row,
  token,
  onClose,
  onDone,
}: {
  row: AdminPaymentRow
  token: string
  onClose: () => void
  onDone: () => void
}) {
  const [note, setNote] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleConfirm() {
    setIsSaving(true)
    setError("")
    try {
      await markPaymentPaid(token, row.id, note || undefined)
      onDone()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to mark payment as paid.")
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
        <h3 className="font-heading text-[19px] text-navy mb-1">Mark payment as paid</h3>
        <p className="text-[13px] text-muted-foreground mb-4">
          {row.userName} — {formatAmount(row)} for {describeItem(row)}. This immediately{" "}
          {row.type === "BLOG" || row.type === "RESEARCH"
            ? "unlocks it for them"
            : "activates their Premium membership"}
          .
        </p>
        {error && (
          <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>
        )}
        <Textarea
          rows={3}
          placeholder="Optional note, e.g. bank transfer reference…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mb-4"
        />
        <div className="flex gap-2">
          <Button className="flex-1" disabled={isSaving} onClick={handleConfirm}>
            {isSaving
              ? "Confirming…"
              : row.type === "BLOG" || row.type === "RESEARCH"
                ? "Confirm & Unlock"
                : "Confirm & Activate Membership"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPaymentsPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [status, setStatus] = useState<PaymentStatus | "">("PENDING")
  const [rows, setRows] = useState<AdminPaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [markingRow, setMarkingRow] = useState<AdminPaymentRow | null>(null)
  const [error, setError] = useState("")

  const loadRows = useCallback(() => {
    if (!token) return
    setLoading(true)
    setError("")
    getAdminPayments(token, status || undefined)
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load payments."))
      .finally(() => setLoading(false))
  }, [token, status])

  useEffect(() => {
    const timeout = setTimeout(loadRows, 0)
    return () => clearTimeout(timeout)
  }, [loadRows])

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Payments" />}>
        <Topbar title="Payments" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Payments" />}>
      <Topbar
        title="Payments"
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
          Online payment isn&apos;t live yet, so members who choose a membership plan or unlock a paid post land here
          as pending orders. Once you&apos;ve received payment out of band (e.g. bank transfer), mark it as paid to
          grant access.
        </p>

        <div className="flex justify-between items-center mb-4">
          <Select className="w-[180px]" value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus | "")}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>

        {error && (
          <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
        ) : (
          <DataTable<AdminPaymentRow>
            emptyMessage="No payments found."
            columns={[
              {
                key: "user",
                header: "Member",
                render: (row) => (
                  <div>
                    <div className="font-semibold text-navy text-[13px]">{row.userName}</div>
                    <div className="text-[11.5px] text-muted-foreground">{row.userEmail}</div>
                  </div>
                ),
              },
              { key: "item", header: "Item", render: (row) => describeItem(row) },
              { key: "amount", header: "Amount", render: (row) => formatAmount(row) },
              {
                key: "gateway",
                header: "Method",
                render: (row) => row.gateway ?? "—",
              },
              { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
              { key: "note", header: "Note", render: (row) => row.note ?? "—" },
              { key: "createdAt", header: "Date", render: (row) => new Date(row.createdAt).toLocaleDateString() },
              {
                key: "actions",
                header: "Actions",
                render: (row) =>
                  row.status === "PENDING" ? (
                    <Button size="sm" variant="secondary" onClick={() => setMarkingRow(row)}>
                      Mark as Paid
                    </Button>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  ),
              },
            ]}
            data={rows}
          />
        )}
      </div>

      {markingRow && (
        <MarkPaidModal token={token} row={markingRow} onClose={() => setMarkingRow(null)} onDone={loadRows} />
      )}
    </AdminShell>
  )
}
