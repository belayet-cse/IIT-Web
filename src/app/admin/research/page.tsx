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
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FormGroup } from "@/components/forms/form-group"
import {
  ApiError,
  createResearchPaper,
  deleteResearchPaper,
  getAdminResearchPaper,
  getAdminResearchPapers,
  getCategories,
  updateResearchPaper,
  type AdminResearchPaperRow,
  type BlogStatus,
  type Category,
  type ResearchPaperDetail,
  type ResearchPaperFormFields,
} from "@/lib/api"

const CERTIFICATIONS = ["CDCS", "CSDG", "CITF", "CTFP", "OTHER"] as const

// ── List tab ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BlogStatus }) {
  return <Badge variant={status === "PUBLISHED" ? "verified" : "pending"}>{status === "PUBLISHED" ? "Published" : "Draft"}</Badge>
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
  const [rows, setRows] = useState<AdminResearchPaperRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadRows = useCallback(() => {
    setLoading(true)
    getAdminResearchPapers(token, { search: search || undefined, status: status || undefined })
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, search, status])

  useEffect(() => {
    const timeout = setTimeout(loadRows, 250)
    return () => clearTimeout(timeout)
  }, [loadRows, refreshKey])

  async function handleTogglePublish(row: AdminResearchPaperRow) {
    setBusyId(row.id)
    setError("")
    try {
      await updateResearchPaper(token, row.id, { status: row.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" })
      loadRows()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update paper status.")
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(row: AdminResearchPaperRow) {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return
    setBusyId(row.id)
    setError("")
    try {
      await deleteResearchPaper(token, row.id)
      loadRows()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete paper.")
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
          placeholder="Search papers by title…"
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
        <DataTable<AdminResearchPaperRow>
          emptyMessage="No research papers yet."
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
            { key: "category", header: "Category", render: (row) => row.category ?? "—" },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "price",
              header: "Price",
              render: (row) => (row.priceBdt > 0 ? `৳${row.priceBdt} / $${row.priceUsd}` : "Free"),
            },
            { key: "views", header: "Views" },
            {
              key: "updatedAt",
              header: "Updated",
              render: (row) => new Date(row.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            },
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

const emptyForm: ResearchPaperFormFields = {
  title: "",
  slug: "",
  abstract: "",
  content: "",
  featuredImage: "",
  category: "",
  status: "DRAFT",
  priceBdt: 0,
  priceUsd: 0,
  certification: undefined,
  readingTime: undefined,
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
  const [form, setForm] = useState<ResearchPaperFormFields>(emptyForm)
  const [tagsInput, setTagsInput] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(!!editingId)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    if (!editingId) return
    getAdminResearchPaper(token, editingId)
      .then((paper: ResearchPaperDetail) => {
        setForm({
          title: paper.title,
          slug: paper.slug,
          abstract: paper.abstract,
          content: paper.content,
          featuredImage: paper.featuredImage ?? "",
          category: paper.category ?? "",
          status: paper.status,
          priceBdt: paper.priceBdt,
          priceUsd: paper.priceUsd,
          certification: paper.certification ?? undefined,
          readingTime: paper.readingTime,
        })
        setTagsInput(paper.tags.join(", "))
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load paper."))
      .finally(() => setLoading(false))
  }, [token, editingId])

  function set<K extends keyof ResearchPaperFormFields>(field: K, value: ResearchPaperFormFields[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(status: BlogStatus) {
    setError("")
    setIsSaving(true)
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
    const payload = { ...form, tags, status }
    try {
      if (editingId) await updateResearchPaper(token, editingId, payload)
      else await createResearchPaper(token, payload)
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save paper.")
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
          <Input placeholder="e.g. Digitalization of Documentary Credits" value={form.title} onChange={(e) => set("title", e.target.value)} />
        </FormGroup>

        <FormGroup label="Slug" hint="Leave blank to auto-generate from the title.">
          <Input placeholder="auto-generated-from-title" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </FormGroup>

        <FormGroup label="Featured Image URL (Optional)">
          <Input placeholder="https://example.com/image.jpg" value={form.featuredImage} onChange={(e) => set("featuredImage", e.target.value)} />
        </FormGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Category">
            <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Relevant Certification (Optional)">
            <Select
              value={form.certification ?? ""}
              onChange={(e) => set("certification", (e.target.value || undefined) as ResearchPaperFormFields["certification"])}
            >
              <option value="">None</option>
              {CERTIFICATIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FormGroup>
        </div>

        <FormGroup label="Tags (Optional)">
          <Input placeholder="comma, separated, tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        </FormGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Price (BDT)" hint="0 = free for everyone, readable without an account.">
            <Input
              type="number"
              min={0}
              value={form.priceBdt ?? 0}
              onChange={(e) => set("priceBdt", e.target.value ? Number(e.target.value) : 0)}
            />
          </FormGroup>
          <FormGroup label="Price (USD)" hint="0 = free for everyone, readable without an account.">
            <Input
              type="number"
              min={0}
              value={form.priceUsd ?? 0}
              onChange={(e) => set("priceUsd", e.target.value ? Number(e.target.value) : 0)}
            />
          </FormGroup>
        </div>

        <FormGroup label="Abstract" required hint="Always public, shown to every reader regardless of purchase.">
          <Textarea rows={3} placeholder="Short academic summary…" value={form.abstract} onChange={(e) => set("abstract", e.target.value)} />
        </FormGroup>

        <FormGroup label="Full Paper" required hint="The gated content — hidden until unlocked, unless the price is 0.">
          <RichTextEditor value={form.content} onChange={(html) => set("content", html)} />
        </FormGroup>

        <FormGroup label="Reading time (minutes)" hint="Leave blank to auto-estimate from word count." className="mb-0">
          <Input
            type="number"
            min={1}
            placeholder="Auto"
            value={form.readingTime ?? ""}
            onChange={(e) => set("readingTime", e.target.value ? Number(e.target.value) : undefined)}
          />
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

export default function AdminResearchPage() {
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
    { id: "list", label: "All Papers" },
    { id: "editor", label: editingId ? "Edit Paper" : "New Paper" },
  ]

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Research Papers" />}>
        <Topbar title="Research Papers" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Research Papers" />}>
      <Topbar
        title="Research Papers"
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
          {activeTab === "list" && <Button onClick={startCreate}>+ New Paper</Button>}
        </div>

        {activeTab === "list" && <ListTab token={token} refreshKey={refreshKey} onEdit={startEdit} />}
        {activeTab === "editor" && (
          <EditorTab token={token} editingId={editingId} onSaved={handleSaved} onCancel={() => setActiveTab("list")} />
        )}
      </div>
    </AdminShell>
  )
}
