"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { AdminShell } from "@/components/layout/admin-shell"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { AdminTabs } from "@/components/admin/admin-tabs"
import { DataTable } from "@/components/admin/data-table"
import { adminNavGroups } from "@/components/admin/admin-nav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { FormGroup } from "@/components/forms/form-group"
import {
  ApiError,
  createEvent,
  deleteEvent,
  getAdminEvent,
  getAdminEvents,
  updateEvent,
  type AdminEventRow,
  type BlogStatus,
  type EventDetail,
  type EventFormat,
  type EventFormFields,
} from "@/lib/api"

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── List tab ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BlogStatus }) {
  return <Badge variant={status === "PUBLISHED" ? "verified" : "pending"}>{status === "PUBLISHED" ? "Published" : "Draft"}</Badge>
}

const formatLabels: Record<EventFormat, string> = {
  IN_PERSON: "In Person",
  VIRTUAL: "Virtual",
  HYBRID: "Hybrid",
}

function ListTab({
  token,
  refreshKey,
  onEdit,
}: {
  token: string
  refreshKey: number
  onEdit: (id: string) => void
}) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<BlogStatus | "">("")
  const [rows, setRows] = useState<AdminEventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadRows = useCallback(() => {
    setLoading(true)
    getAdminEvents(token, { search: search || undefined, status: status || undefined })
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, search, status])

  useEffect(() => {
    const timeout = setTimeout(loadRows, 250)
    return () => clearTimeout(timeout)
  }, [loadRows, refreshKey])

  async function handleTogglePublish(row: AdminEventRow) {
    setBusyId(row.id)
    setError("")
    try {
      await updateEvent(token, row.id, { status: row.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" })
      loadRows()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update event status.")
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(row: AdminEventRow) {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return
    setBusyId(row.id)
    setError("")
    try {
      await deleteEvent(token, row.id)
      loadRows()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete event.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      {error && (
        <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>
      )}
      <div className="flex justify-between items-center mb-4 gap-3">
        <Input
          placeholder="Search events by title…"
          className="w-[280px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select className="w-[160px]" value={status} onChange={(e) => setStatus(e.target.value as BlogStatus | "")}>
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
      ) : (
        <DataTable<AdminEventRow>
          emptyMessage="No events yet."
          columns={[
            {
              key: "title",
              header: "Title",
              render: (row) => (
                <div>
                  <div className="font-semibold text-navy text-[13px]">{row.title}</div>
                  <div className="text-[11.5px] text-muted-foreground">/{row.slug}</div>
                </div>
              ),
            },
            {
              key: "startAt",
              header: "Date",
              render: (row) => new Date(row.startAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
            },
            { key: "location", header: "Location", render: (row) => row.location || "—" },
            { key: "format", header: "Format", render: (row) => formatLabels[row.format] },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            { key: "featured", header: "Featured", render: (row) => (row.featured ? "★" : "—") },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(row.id)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="secondary" disabled={busyId === row.id} onClick={() => handleTogglePublish(row)}>
                    {row.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                  </Button>
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
  )
}

// ── Editor tab ───────────────────────────────────────────────────────────────

const emptyForm: EventFormFields = {
  title: "",
  slug: "",
  description: "",
  startAt: "",
  location: "",
  format: "IN_PERSON",
  featuredImage: "",
  featured: false,
  status: "DRAFT",
}

function EditorTab({
  token,
  editingId,
  onSaved,
  onCancel,
}: {
  token: string
  editingId: string | null
  onSaved: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<EventFormFields>(emptyForm)
  const [loading, setLoading] = useState(!!editingId)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!editingId) return
    getAdminEvent(token, editingId)
      .then((event: EventDetail) => {
        setForm({
          title: event.title,
          slug: event.slug,
          description: event.description,
          startAt: toDatetimeLocal(event.startAt),
          location: event.location ?? "",
          format: event.format,
          featuredImage: event.featuredImage ?? "",
          featured: event.featured,
          status: event.status,
        })
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load event."))
      .finally(() => setLoading(false))
  }, [token, editingId])

  function set<K extends keyof EventFormFields>(field: K, value: EventFormFields[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(status: BlogStatus) {
    setError("")
    setIsSaving(true)
    const payload = { ...form, status, startAt: new Date(form.startAt).toISOString() }
    try {
      if (editingId) await updateEvent(token, editingId, payload)
      else await createEvent(token, payload)
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save event.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>

  return (
    <div className="max-w-[820px]">
      {error && (
        <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-5">{error}</p>
      )}

      <div className="bg-card border border-border rounded-xl p-[30px] mb-6">
        <FormGroup label="Title" required>
          <Input placeholder="e.g. Trade Finance Summit 2026" value={form.title} onChange={(e) => set("title", e.target.value)} />
        </FormGroup>

        <FormGroup label="Slug" hint="Leave blank to auto-generate from the title.">
          <Input placeholder="auto-generated-from-title" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </FormGroup>

        <FormGroup label="Description" required>
          <Textarea rows={3} placeholder="What this event is about…" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </FormGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Date & Time" required>
            <Input type="datetime-local" value={form.startAt} onChange={(e) => set("startAt", e.target.value)} />
          </FormGroup>
          <FormGroup label="Format">
            <Select value={form.format} onChange={(e) => set("format", e.target.value as EventFormat)}>
              <option value="IN_PERSON">In Person</option>
              <option value="VIRTUAL">Virtual</option>
              <option value="HYBRID">Hybrid</option>
            </Select>
          </FormGroup>
        </div>

        <FormGroup label="Location (Optional)" hint="e.g. Dhaka + Virtual, or a physical address.">
          <Input placeholder="Dhaka, Bangladesh" value={form.location} onChange={(e) => set("location", e.target.value)} />
        </FormGroup>

        <FormGroup label="Featured Image URL (Optional)">
          <Input placeholder="https://example.com/image.jpg" value={form.featuredImage} onChange={(e) => set("featuredImage", e.target.value)} />
        </FormGroup>

        <FormGroup label="Featured" className="mb-0" hint="Shown in the Featured Event section on the public Events page.">
          <Toggle checked={form.featured ?? false} onChange={(v) => set("featured", v)} />
        </FormGroup>
      </div>

      <div className="flex gap-2 mt-2">
        <Button disabled={isSaving} onClick={() => handleSubmit("PUBLISHED")}>
          {isSaving ? "Publishing…" : "Publish"}
        </Button>
        <Button variant="secondary" disabled={isSaving} onClick={() => handleSubmit("DRAFT")}>
          {isSaving ? "Saving…" : "Save as draft"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminEventsPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [activeTab, setActiveTab] = useState<"list" | "editor">("list")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function startCreate() {
    setEditingId(null)
    setActiveTab("editor")
  }

  function startEdit(id: string) {
    setEditingId(id)
    setActiveTab("editor")
  }

  function handleSaved() {
    setRefreshKey((k) => k + 1)
    setActiveTab("list")
  }

  const tabs = [
    { id: "list", label: "All Events" },
    { id: "editor", label: editingId ? "Edit Event" : "New Event" },
  ]

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Events" />}>
        <Topbar title="Events" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Events" />}>
      <Topbar
        title="Events"
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
        <div className="flex justify-between items-center">
          <AdminTabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as "list" | "editor")} />
          {activeTab === "list" && <Button onClick={startCreate}>+ New Event</Button>}
        </div>

        {activeTab === "list" && <ListTab token={token} refreshKey={refreshKey} onEdit={startEdit} />}
        {activeTab === "editor" && (
          <EditorTab token={token} editingId={editingId} onSaved={handleSaved} onCancel={() => setActiveTab("list")} />
        )}
      </div>
    </AdminShell>
  )
}
