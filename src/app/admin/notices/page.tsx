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
import { Toggle } from "@/components/ui/toggle"
import {
  ApiError,
  createNotice,
  deleteNotice,
  getAdminNotices,
  reorderNotices,
  updateNotice,
  type SiteNotice,
} from "@/lib/api"

function NoticeRow({
  notice,
  token,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onChanged,
}: {
  notice: SiteNotice
  token: string
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onChanged: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(notice.text)
  const [href, setHref] = useState(notice.href ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    if (!text.trim()) {
      setError("Notice text can't be empty.")
      return
    }
    setBusy(true)
    setError("")
    try {
      await updateNotice(token, notice.id, { text: text.trim(), href: href.trim() })
      setEditing(false)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save notice.")
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleActive(active: boolean) {
    setBusy(true)
    setError("")
    try {
      await updateNotice(token, notice.id, { active })
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update notice.")
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this notice? This can't be undone.")) return
    setBusy(true)
    setError("")
    try {
      await deleteNotice(token, notice.id)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete notice.")
      setBusy(false)
    }
  }

  return (
    <div className="flex items-start gap-3 px-5 py-3 border-b border-[#f1f2f5] last:border-b-0">
      <div className="flex flex-col gap-0.5 pt-1">
        <button
          type="button"
          disabled={isFirst || busy}
          onClick={onMoveUp}
          className="text-muted-foreground hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed text-xs leading-none"
          title="Move up"
        >
          ▲
        </button>
        <button
          type="button"
          disabled={isLast || busy}
          onClick={onMoveDown}
          className="text-muted-foreground hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed text-xs leading-none"
          title="Move down"
        >
          ▼
        </button>
      </div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex flex-col gap-2 max-w-[440px]">
            <Input
              autoFocus
              placeholder="Notice text…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Input
              placeholder="Link (optional) — e.g. /events or https://…"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
        ) : (
          <div>
            <span className={`text-[13.5px] font-semibold ${notice.active ? "text-navy" : "text-muted-foreground line-through"}`}>
              {notice.text}
            </span>
            {notice.href && (
              <span className="block text-[12px] text-gold mt-0.5 truncate">{notice.href}</span>
            )}
          </div>
        )}
        {error && <p className="text-[12px] text-destructive mt-1">{error}</p>}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <Toggle checked={notice.active} disabled={busy} onChange={handleToggleActive} />
        {editing ? (
          <>
            <Button size="sm" disabled={busy} onClick={handleSave}>
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setEditing(false)
                setText(notice.text)
                setHref(notice.href ?? "")
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setEditing(true)}>
              Edit
            </Button>
            <button
              disabled={busy}
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-semibold border text-red-700 border-red-200 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminNoticesPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [notices, setNotices] = useState<SiteNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [newText, setNewText] = useState("")
  const [newHref, setNewHref] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    if (!token) return
    setLoading(true)
    getAdminNotices(token)
      .then(setNotices)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    const timeout = setTimeout(load, 0)
    return () => clearTimeout(timeout)
  }, [load])

  async function handleCreate() {
    if (!token || !newText.trim()) return
    setCreating(true)
    setError("")
    try {
      await createNotice(token, { text: newText.trim(), href: newHref.trim() || undefined })
      setNewText("")
      setNewHref("")
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create notice.")
    } finally {
      setCreating(false)
    }
  }

  async function move(index: number, direction: -1 | 1) {
    if (!token) return
    const next = [...notices]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setNotices(next)
    try {
      await reorderNotices(token, next.map((n) => n.id))
    } catch {
      load()
    }
  }

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} />}>
        <Topbar title="Notices" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} />}>
      <Topbar
        title="Notices"
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

      <div className="p-8 flex-1 max-w-[680px]">
        <p className="text-[13px] text-muted-foreground mb-5">
          These notices scroll in the marquee on the homepage and the Alumni Network page. Only{" "}
          <strong>active</strong> notices are shown to visitors — use the toggle to pause one without deleting it,
          and the arrows to control the order they scroll in.
        </p>

        <div className="flex flex-col gap-2 mb-5 max-w-[440px]">
          <Input
            placeholder="Notice text…"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Link (optional) — e.g. /events or https://…"
              value={newHref}
              onChange={(e) => setNewHref(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button disabled={creating || !newText.trim()} onClick={handleCreate} className="flex-shrink-0">
              {creating ? "Adding…" : "Add Notice"}
            </Button>
          </div>
        </div>
        {error && <p className="text-[13px] text-destructive bg-destructive/10 rounded-sm px-3.5 py-2.5 mb-4">{error}</p>}

        {loading ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {notices.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13.5px] text-muted-foreground">No notices yet.</p>
            ) : (
              notices.map((notice, index) => (
                <NoticeRow
                  key={notice.id}
                  notice={notice}
                  token={token}
                  isFirst={index === 0}
                  isLast={index === notices.length - 1}
                  onMoveUp={() => move(index, -1)}
                  onMoveDown={() => move(index, 1)}
                  onChanged={load}
                />
              ))
            )}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
