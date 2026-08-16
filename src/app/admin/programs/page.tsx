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
  createProgram,
  deleteProgram,
  getAdminProgram,
  getAdminPrograms,
  updateProgram,
  type AdminProgramRow,
  type BlogStatus,
  type ProgramDetail,
  type ProgramFormFields,
  type ProgramModuleFormFields,
  type ProgramType,
} from "@/lib/api"

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
  const [rows, setRows] = useState<AdminProgramRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadRows = useCallback(() => {
    setLoading(true)
    getAdminPrograms(token, { search: search || undefined, status: status || undefined })
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, search, status])

  useEffect(() => {
    const timeout = setTimeout(loadRows, 250)
    return () => clearTimeout(timeout)
  }, [loadRows, refreshKey])

  async function handleTogglePublish(row: AdminProgramRow) {
    setBusyId(row.id)
    setError("")
    try {
      await updateProgram(token, row.id, { status: row.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" })
      loadRows()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update program status.")
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(row: AdminProgramRow) {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return
    setBusyId(row.id)
    setError("")
    try {
      await deleteProgram(token, row.id)
      loadRows()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete program.")
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
          placeholder="Search programs by title…"
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
        <DataTable<AdminProgramRow>
          emptyMessage="No programs yet."
          columns={[
            {
              key: "title",
              header: "Title",
              render: (row) => (
                <div>
                  <div className="font-semibold text-navy text-[13px]">
                    {row.code ? `${row.code} — ${row.title}` : row.title}
                  </div>
                  <div className="text-[11.5px] text-muted-foreground">/{row.slug}</div>
                </div>
              ),
            },
            { key: "type", header: "Type", render: (row) => (row.type === "INTERNATIONAL" ? "International" : "Proprietary") },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "price",
              header: "Price",
              render: (row) => (row.priceBdt > 0 ? `৳${row.priceBdt} / $${row.priceUsd}` : "Free"),
            },
            { key: "enrollmentCount", header: "Enrolled" },
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
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border text-red-700 border-red-200 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
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

// ── Module sub-editor ────────────────────────────────────────────────────────

function ModulesEditor({
  modules,
  onChange,
}: {
  modules: ProgramModuleFormFields[]
  onChange: (modules: ProgramModuleFormFields[]) => void
}) {
  function updateModule(index: number, patch: Partial<ProgramModuleFormFields>) {
    onChange(modules.map((m, i) => (i === index ? { ...m, ...patch } : m)))
  }

  function removeModule(index: number) {
    onChange(modules.filter((_, i) => i !== index))
  }

  function addModule() {
    onChange([...modules, { title: "", videoUrl: "" }])
  }

  return (
    <div>
      {modules.map((m, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <Input
            placeholder="Module title"
            value={m.title}
            onChange={(e) => updateModule(i, { title: e.target.value })}
            className="flex-1"
          />
          <Input
            placeholder="Video URL (YouTube/Vimeo)"
            value={m.videoUrl ?? ""}
            onChange={(e) => updateModule(i, { videoUrl: e.target.value })}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => removeModule(i)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addModule}>
        + Add Module
      </Button>
    </div>
  )
}

// ── Editor tab ───────────────────────────────────────────────────────────────

const emptyForm: ProgramFormFields = {
  title: "",
  slug: "",
  code: "",
  type: "INTERNATIONAL",
  overview: "",
  whoItsFor: "",
  examInfo: "",
  featuredImage: "",
  priceBdt: 0,
  priceUsd: 0,
  freeForBasic: false,
  freeForPro: false,
  freeForElite: false,
  featured: false,
  status: "DRAFT",
  modules: [],
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
  const [form, setForm] = useState<ProgramFormFields>(emptyForm)
  const [loading, setLoading] = useState(!!editingId)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!editingId) return
    getAdminProgram(token, editingId)
      .then((program: ProgramDetail) => {
        setForm({
          title: program.title,
          slug: program.slug,
          code: program.code ?? "",
          type: program.type,
          overview: program.overview,
          whoItsFor: program.whoItsFor ?? "",
          examInfo: program.examInfo ?? "",
          featuredImage: program.featuredImage ?? "",
          priceBdt: program.priceBdt,
          priceUsd: program.priceUsd,
          freeForBasic: program.freeForBasic,
          freeForPro: program.freeForPro,
          freeForElite: program.freeForElite,
          featured: program.featured,
          status: program.status,
          modules: program.modules.map((m) => ({ title: m.title, videoUrl: m.videoUrl ?? "", sequence: m.sequence })),
        })
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load program."))
      .finally(() => setLoading(false))
  }, [token, editingId])

  function set<K extends keyof ProgramFormFields>(field: K, value: ProgramFormFields[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(status: BlogStatus) {
    setError("")
    setIsSaving(true)
    const payload = { ...form, status }
    try {
      if (editingId) await updateProgram(token, editingId, payload)
      else await createProgram(token, payload)
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save program.")
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Title" required>
            <Input placeholder="e.g. Certified Documentary Credit Specialist" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </FormGroup>
          <FormGroup label="Code (Optional)" hint="Short badge, e.g. CDCS">
            <Input placeholder="CDCS" value={form.code} onChange={(e) => set("code", e.target.value)} />
          </FormGroup>
        </div>

        <FormGroup label="Slug" hint="Leave blank to auto-generate from the title. Set to a short value like 'cdcs' for clean URLs.">
          <Input placeholder="auto-generated-from-title" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </FormGroup>

        <FormGroup label="Featured Image URL (Optional)">
          <Input placeholder="https://example.com/image.jpg" value={form.featuredImage} onChange={(e) => set("featuredImage", e.target.value)} />
        </FormGroup>

        <FormGroup label="Type">
          <Select value={form.type} onChange={(e) => set("type", e.target.value as ProgramType)}>
            <option value="INTERNATIONAL">International</option>
            <option value="PROPRIETARY">Proprietary</option>
          </Select>
        </FormGroup>

        <FormGroup label="Overview" required>
          <Textarea rows={3} placeholder="What this certification covers…" value={form.overview} onChange={(e) => set("overview", e.target.value)} />
        </FormGroup>

        <FormGroup label="Who It's For (Optional)">
          <Textarea rows={2} value={form.whoItsFor} onChange={(e) => set("whoItsFor", e.target.value)} />
        </FormGroup>

        <FormGroup label="Exam Info (Optional)">
          <Textarea rows={2} value={form.examInfo} onChange={(e) => set("examInfo", e.target.value)} />
        </FormGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Price (BDT)" hint="0 = free enrollment for everyone.">
            <Input
              type="number"
              min={0}
              value={form.priceBdt ?? 0}
              onChange={(e) => set("priceBdt", e.target.value ? Number(e.target.value) : 0)}
            />
          </FormGroup>
          <FormGroup label="Price (USD)" hint="0 = free enrollment for everyone.">
            <Input
              type="number"
              min={0}
              value={form.priceUsd ?? 0}
              onChange={(e) => set("priceUsd", e.target.value ? Number(e.target.value) : 0)}
            />
          </FormGroup>
        </div>

        <FormGroup label="Free for Premium tier" hint="Members of the matching tier enroll free, bypassing the price above.">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[13px] text-foreground">
              <Toggle checked={form.freeForBasic ?? false} onChange={(v) => set("freeForBasic", v)} />
              <span>Basic</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-foreground">
              <Toggle checked={form.freeForPro ?? false} onChange={(v) => set("freeForPro", v)} />
              <span>Pro</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-foreground">
              <Toggle checked={form.freeForElite ?? false} onChange={(v) => set("freeForElite", v)} />
              <span>Elite</span>
            </div>
          </div>
        </FormGroup>

        <FormGroup label="Featured" className="mb-0">
          <Toggle checked={form.featured ?? false} onChange={(v) => set("featured", v)} />
        </FormGroup>
      </div>

      <div className="bg-card border border-border rounded-xl p-[30px] mb-6">
        <h3 className="font-heading text-[16px] text-navy mb-4">Curriculum Modules</h3>
        <ModulesEditor modules={form.modules ?? []} onChange={(modules) => set("modules", modules)} />
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

export default function AdminProgramsPage() {
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
    { id: "list", label: "All Programs" },
    { id: "editor", label: editingId ? "Edit Program" : "New Program" },
  ]

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Certifications" />}>
        <Topbar title="Certification Programs" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Certifications" />}>
      <Topbar
        title="Certification Programs"
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
        <div className="flex justify-between items-center">
          <AdminTabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as "list" | "editor")} />
          {activeTab === "list" && <Button onClick={startCreate}>+ New Program</Button>}
        </div>

        {activeTab === "list" && <ListTab token={token} refreshKey={refreshKey} onEdit={startEdit} />}
        {activeTab === "editor" && (
          <EditorTab token={token} editingId={editingId} onSaved={handleSaved} onCancel={() => setActiveTab("list")} />
        )}
      </div>
    </AdminShell>
  )
}
