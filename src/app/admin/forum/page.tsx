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
import {
  ApiError,
  deleteForumThread,
  getAdminForumThreads,
  updateForumThread,
  type AdminForumThreadRow,
} from "@/lib/api"

export default function AdminForumPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [rows, setRows] = useState<AdminForumThreadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadRows = useCallback(() => {
    if (!token) return
    setLoading(true)
    setError("")
    getAdminForumThreads(token)
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load threads."))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    const timeout = setTimeout(loadRows, 0)
    return () => clearTimeout(timeout)
  }, [loadRows])

  async function togglePinned(row: AdminForumThreadRow) {
    if (!token) return
    setBusyId(row.id)
    try {
      await updateForumThread(token, row.id, { pinned: !row.pinned })
      loadRows()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update thread.")
    } finally {
      setBusyId(null)
    }
  }

  async function toggleLocked(row: AdminForumThreadRow) {
    if (!token) return
    setBusyId(row.id)
    try {
      await updateForumThread(token, row.id, { locked: !row.locked })
      loadRows()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update thread.")
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(row: AdminForumThreadRow) {
    if (!token) return
    if (!confirm(`Delete "${row.title}"? This removes all its replies too.`)) return
    setBusyId(row.id)
    try {
      await deleteForumThread(token, row.id)
      loadRows()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete thread.")
    } finally {
      setBusyId(null)
    }
  }

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Forum Moderation" />}>
        <Topbar title="Forum Moderation" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Forum Moderation" />}>
      <Topbar
        title="Forum Moderation"
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
        {error && (
          <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
        ) : (
          <DataTable<AdminForumThreadRow>
            emptyMessage="No threads yet."
            columns={[
              {
                key: "title",
                header: "Thread",
                render: (row) => (
                  <div>
                    <Link href={`/forum/${row.id}`} target="_blank" className="font-semibold text-navy text-[13px] hover:underline">
                      {row.title}
                    </Link>
                    <div className="text-[11.5px] text-muted-foreground">
                      {row.authorName} · {row.authorEmail}
                    </div>
                  </div>
                ),
              },
              { key: "category", header: "Category", render: (row) => row.category ?? "—" },
              { key: "replyCount", header: "Replies" },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <div className="flex gap-1.5">
                    {row.pinned && <Badge variant="verified">Pinned</Badge>}
                    {row.locked && <Badge variant="error">Locked</Badge>}
                  </div>
                ),
              },
              { key: "lastActivityAt", header: "Last Activity", render: (row) => new Date(row.lastActivityAt).toLocaleDateString() },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                  <div className="flex gap-2">
                    <button
                      disabled={busyId === row.id}
                      onClick={() => togglePinned(row)}
                      className="inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-semibold border border-border bg-white hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {row.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      disabled={busyId === row.id}
                      onClick={() => toggleLocked(row)}
                      className="inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-semibold border border-border bg-white hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {row.locked ? "Unlock" : "Lock"}
                    </button>
                    <button
                      disabled={busyId === row.id}
                      onClick={() => handleDelete(row)}
                      className="inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-semibold border text-red-700 border-red-200 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                ),
              },
            ]}
            data={rows}
          />
        )}
      </div>
    </AdminShell>
  )
}
