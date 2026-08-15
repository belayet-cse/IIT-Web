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
  createBlog,
  deleteBlog,
  getAdminBlog,
  getAdminBlogs,
  updateBlog,
  type AdminBlogRow,
  type BlogDetail,
  type BlogFormFields,
  type BlogStatus,
} from "@/lib/api"

// ── Content helpers ──────────────────────────────────────────────────────────

function looksLikeHtml(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content)
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// Legacy posts were stored as plain text with blank-line-separated paragraphs.
// Wrap them in <p> tags so they load into the rich editor as real paragraphs
// instead of one run-on block.
function toEditableHtml(content: string) {
  if (looksLikeHtml(content)) return content
  return content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("")
}

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
  const [rows, setRows] = useState<AdminBlogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadRows = useCallback(() => {
    setLoading(true)
    getAdminBlogs(token, { search: search || undefined, status: status || undefined })
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, search, status])

  useEffect(() => {
    const timeout = setTimeout(loadRows, 250)
    return () => clearTimeout(timeout)
  }, [loadRows, refreshKey])

  async function handleTogglePublish(row: AdminBlogRow) {
    setBusyId(row.id)
    setError("")
    try {
      await updateBlog(token, row.id, { status: row.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" })
      loadRows()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update post status.")
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(row: AdminBlogRow) {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return
    setBusyId(row.id)
    setError("")
    try {
      await deleteBlog(token, row.id)
      loadRows()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete post.")
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
          placeholder="Search posts by title…"
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
        <DataTable<AdminBlogRow>
          emptyMessage="No blog posts yet."
          columns={[
            {
              key: "featuredImage",
              header: "Cover",
              render: (row) =>
                row.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.featuredImage} alt="" className="w-12 h-12 rounded-lg object-cover border border-border" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground text-[10px]">
                    No image
                  </div>
                ),
            },
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
            { key: "views", header: "Views" },
            { key: "readingTime", header: "Reading", render: (row) => `${row.readingTime} min` },
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

// ── Editor tab ───────────────────────────────────────────────────────────────

const emptyForm: BlogFormFields = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  metaTitle: "",
  metaDescription: "",
  category: "",
  status: "DRAFT",
  readingTime: undefined,
}

const MAX_FEATURED_IMAGE_BYTES = 4 * 1024 * 1024

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function FeaturedImageField({ value, onChange }: { value: string; onChange: (dataUrl: string) => void }) {
  const [error, setError] = useState("")

  async function handleFile(file: File | null) {
    if (!file) return
    setError("")
    if (file.size > MAX_FEATURED_IMAGE_BYTES) {
      setError("Image is too large — please use one under 4MB.")
      return
    }
    try {
      onChange(await readFileAsDataUrl(file))
    } catch {
      setError("Failed to read the selected image.")
    }
  }

  return (
    <div>
      {value ? (
        <div className="flex items-center gap-3 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-24 h-24 rounded-lg object-cover border border-border" />
          <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>
            Remove image
          </Button>
        </div>
      ) : (
        <Input type="file" accept="image/*" className="py-2" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
      )}
      {error && <p className="text-[12px] text-destructive mt-1.5">{error}</p>}
    </div>
  )
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
  const [form, setForm] = useState<BlogFormFields>(emptyForm)
  const [loading, setLoading] = useState(!!editingId)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!editingId) return
    getAdminBlog(token, editingId)
      .then((post: BlogDetail) =>
        setForm({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: toEditableHtml(post.content),
          featuredImage: post.featuredImage ?? "",
          metaTitle: post.metaTitle ?? "",
          metaDescription: post.metaDescription ?? "",
          category: post.category ?? "",
          status: post.status,
          readingTime: post.readingTime,
        })
      )
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load post."))
      .finally(() => setLoading(false))
  }, [token, editingId])

  function set<K extends keyof BlogFormFields>(field: K, value: BlogFormFields[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(status: BlogStatus) {
    const contentIsEmpty = form.content.replace(/<[^>]*>/g, "").trim().length === 0
    if (!form.title.trim() || contentIsEmpty) {
      setError("Title and content are required.")
      return
    }
    setError("")
    setIsSaving(true)
    try {
      const payload: BlogFormFields = {
        ...form,
        slug: form.slug?.trim() || undefined,
        excerpt: form.excerpt?.trim() || undefined,
        metaTitle: form.metaTitle?.trim() || undefined,
        metaDescription: form.metaDescription?.trim() || undefined,
        category: form.category?.trim() || undefined,
        status,
      }
      if (editingId) {
        await updateBlog(token, editingId, payload)
      } else {
        await createBlog(token, payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save post.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>

  return (
    <div className="bg-card border border-border rounded-xl p-[30px] max-w-[820px]">
      {error && (
        <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-5">{error}</p>
      )}

      <FormGroup label="Title" required>
        <Input placeholder="e.g. The Definition of Confirming Bank" value={form.title} onChange={(e) => set("title", e.target.value)} />
      </FormGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup label="Slug" hint="Leave blank to auto-generate from the title.">
          <Input placeholder="auto-generated-from-title" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </FormGroup>
        <FormGroup label="Category">
          <Input placeholder="e.g. UCP" value={form.category} onChange={(e) => set("category", e.target.value)} />
        </FormGroup>
      </div>

      <FormGroup label="Featured Image" hint="Shown on the blog listing and post header. JPG or PNG, up to 4MB.">
        <FeaturedImageField value={form.featuredImage ?? ""} onChange={(dataUrl) => set("featuredImage", dataUrl)} />
      </FormGroup>

      <FormGroup label="Excerpt" hint="Shown on the blog listing. Leave blank to auto-generate from the content.">
        <Textarea rows={2} placeholder="Short teaser for this post…" value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
      </FormGroup>

      <FormGroup label="Content" required hint="Use the toolbar for headings, bold, color, alignment, and lists.">
        <RichTextEditor value={form.content} onChange={(html) => set("content", html)} />
      </FormGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup label="Reading time (minutes)" hint="Leave blank to auto-estimate from word count.">
          <Input
            type="number"
            min={1}
            placeholder="Auto"
            value={form.readingTime ?? ""}
            onChange={(e) => set("readingTime", e.target.value ? Number(e.target.value) : undefined)}
          />
        </FormGroup>
        <FormGroup label="Meta title" hint="Used for SEO — defaults to the title if left blank.">
          <Input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
        </FormGroup>
      </div>

      <FormGroup label="Meta description" hint="Used for SEO — defaults to the excerpt if left blank.">
        <Textarea rows={2} value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
      </FormGroup>

      <div className="flex gap-2 mt-2">
        <Button disabled={isSaving} onClick={() => handleSubmit("PUBLISHED")}>
          {isSaving ? "Saving…" : "Publish"}
        </Button>
        <Button variant="secondary" disabled={isSaving} onClick={() => handleSubmit("DRAFT")}>
          Save as draft
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminBlogsPage() {
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
    { id: "list", label: "All Posts" },
    { id: "editor", label: editingId ? "Edit Post" : "New Post" },
  ]

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Blog Posts" />}>
        <Topbar title="Blog Posts" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Blog Posts" />}>
      <Topbar
        title="Blog Posts"
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
          {activeTab === "list" && <Button onClick={startCreate}>+ New Post</Button>}
        </div>

        {activeTab === "list" && <ListTab token={token} refreshKey={refreshKey} onEdit={startEdit} />}
        {activeTab === "editor" && (
          <EditorTab token={token} editingId={editingId} onSaved={handleSaved} onCancel={() => setActiveTab("list")} />
        )}
      </div>
    </AdminShell>
  )
}
