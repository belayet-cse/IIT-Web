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
import { PostView } from "@/components/blog/post-view"
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
  getCategories,
  getSubCategories,
  reorderBlogs,
  updateBlog,
  type AdminBlogRow,
  type BlogDetail,
  type BlogFormFields,
  type BlogStatus,
  type Category,
  type SubCategory,
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

// Rough estimate for the preview when the writer hasn't set an explicit
// reading time yet — the server computes the authoritative value on save.
function estimatePreviewReadingTime(html: string) {
  const words = html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
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
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [rows, setRows] = useState<AdminBlogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  const loadRows = useCallback(() => {
    setLoading(true)
    getAdminBlogs(token, { search: search || undefined, status: status || undefined, category: category || undefined })
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, search, status, category])

  useEffect(() => {
    const timeout = setTimeout(loadRows, 250)
    return () => clearTimeout(timeout)
  }, [loadRows, refreshKey])

  async function moveInCategory(index: number, direction: -1 | 1) {
    if (!category) return
    const target = index + direction
    if (target < 0 || target >= rows.length) return
    const next = [...rows]
    ;[next[index], next[target]] = [next[target], next[index]]
    setRows(next)
    try {
      await reorderBlogs(token, category, next.map((r) => r.id))
    } catch {
      loadRows()
    }
  }

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
        <div className="flex gap-3">
          <Select className="w-[190px]" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select className="w-[160px]" value={status} onChange={(e) => setStatus(e.target.value as BlogStatus | "")}>
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </Select>
        </div>
      </div>

      {category && (
        <p className="text-[12.5px] text-muted-foreground mb-3">
          Showing posts in <strong>{category}</strong> in the order readers will see them. Use the arrows to reorder.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
      ) : (
        <DataTable<AdminBlogRow>
          emptyMessage="No blog posts yet."
          columns={[
            ...(category
              ? [
                  {
                    key: "order",
                    header: "Order",
                    render: (row: AdminBlogRow) => {
                      const index = rows.findIndex((r) => r.id === row.id)
                      return (
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveInCategory(index, -1)}
                            className="text-muted-foreground hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed text-xs leading-none"
                            title="Move up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={index === rows.length - 1}
                            onClick={() => moveInCategory(index, 1)}
                            className="text-muted-foreground hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed text-xs leading-none"
                            title="Move down"
                          >
                            ▼
                          </button>
                        </div>
                      )
                    },
                  },
                ]
              : []),
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
            { key: "subCategory", header: "Subcategory", render: (row) => row.subCategory ?? "—" },
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
                  <a
                    href={`/blogs/${row.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Opens the real post page in a new tab — visible to you as an admin even while it's a draft."
                    className="inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-semibold border text-navy border-border bg-white hover:bg-muted transition-colors"
                  >
                    Preview
                  </a>
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

const emptyForm: BlogFormFields = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featuredImage: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  category: "",
  subCategory: "",
  status: "DRAFT",
  priceBdt: 0,
  priceUsd: 0,
  readingTime: undefined,
}

const MAX_FEATURED_IMAGE_BYTES = 8 * 1024 * 1024
const FEATURED_IMAGE_MAX_WIDTH = 1000
const FEATURED_IMAGE_JPEG_QUALITY = 0.8

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to decode image"))
    img.src = src
  })
}

// Downscales and re-encodes as JPEG in the browser before it ever hits the
// network — keeps uploads (and the resulting API payload) small regardless
// of how large the original photo is.
async function resizeImageFile(file: File): Promise<string> {
  const original = await readFileAsDataUrl(file)
  const img = await loadImage(original)

  const scale = Math.min(1, FEATURED_IMAGE_MAX_WIDTH / img.width)
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return original
  ctx.drawImage(img, 0, 0, width, height)

  const resized = canvas.toDataURL("image/jpeg", FEATURED_IMAGE_JPEG_QUALITY)
  return resized.length < original.length ? resized : original
}

function FeaturedImageField({ value, onChange }: { value: string; onChange: (dataUrl: string) => void }) {
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState(false)

  async function handleFile(file: File | null) {
    if (!file) return
    setError("")
    if (file.size > MAX_FEATURED_IMAGE_BYTES) {
      setError("Image is too large — please use one under 8MB.")
      return
    }
    setProcessing(true)
    try {
      onChange(await resizeImageFile(file))
    } catch {
      setError("Failed to read the selected image.")
    } finally {
      setProcessing(false)
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
      ) : processing ? (
        <p className="text-[13px] text-muted-foreground py-2">Processing image…</p>
      ) : (
        <>
          <Input type="file" accept="image/*" className="py-2 mb-3" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          <label className="block text-[12px] text-muted-foreground mb-1.5">Or paste an image URL</label>
          <Input
            placeholder="https://example.com/image.jpg"
            onChange={(e) => onChange(e.target.value)}
          />
        </>
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
  const { data: session } = useSession()
  const [form, setForm] = useState<BlogFormFields>(emptyForm)
  const [tagsInput, setTagsInput] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(!!editingId)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  const selectedCategoryId = categories.find((c) => c.name === form.category)?.id

  useEffect(() => {
    if (!selectedCategoryId) {
      setSubCategories([])
      return
    }
    getSubCategories(selectedCategoryId).then(setSubCategories).catch(() => {})
  }, [selectedCategoryId])

  useEffect(() => {
    if (!editingId) return
    getAdminBlog(token, editingId)
      .then((post: BlogDetail) => {
        setForm({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: toEditableHtml(post.content),
          featuredImage: post.featuredImage ?? "",
          metaTitle: post.metaTitle ?? "",
          metaDescription: post.metaDescription ?? "",
          metaKeywords: post.metaKeywords ?? "",
          category: post.category ?? "",
          subCategory: post.subCategory ?? "",
          status: post.status,
          priceBdt: post.priceBdt,
          priceUsd: post.priceUsd,
          readingTime: post.readingTime,
        })
        setTagsInput(post.tags.join(", "))
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load post."))
      .finally(() => setLoading(false))
  }, [token, editingId])

  function set<K extends keyof BlogFormFields>(field: K, value: BlogFormFields[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validateForm() {
    const contentIsEmpty = form.content.replace(/<[^>]*>/g, "").trim().length === 0
    if (!form.title.trim() || contentIsEmpty) {
      setError("Title and content are required.")
      return false
    }
    setError("")
    return true
  }

  function openPreview() {
    if (!validateForm()) return
    setShowPreview(true)
  }

  async function handleSubmit(status: BlogStatus) {
    if (!validateForm()) return
    setIsSaving(true)
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      const payload: BlogFormFields = {
        ...form,
        slug: form.slug?.trim() || undefined,
        excerpt: form.excerpt?.trim() || undefined,
        metaTitle: form.metaTitle?.trim() || undefined,
        metaDescription: form.metaDescription?.trim() || undefined,
        metaKeywords: form.metaKeywords?.trim() || undefined,
        category: form.category?.trim() || undefined,
        subCategory: form.subCategory?.trim() || undefined,
        tags,
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
    <div className="max-w-[820px]">
      {error && (
        <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-5">{error}</p>
      )}

      <div className="bg-card border border-border rounded-xl p-[30px] mb-6">
        <FormGroup label="Title" required>
          <Input placeholder="e.g. The Definition of Confirming Bank" value={form.title} onChange={(e) => set("title", e.target.value)} />
        </FormGroup>

        <FormGroup label="Slug" hint="Leave blank to auto-generate from the title.">
          <Input placeholder="auto-generated-from-title" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </FormGroup>

        <FormGroup label="Featured Image" hint="Shown on the blog listing and post header. JPG or PNG, up to 8MB.">
          <FeaturedImageField value={form.featuredImage ?? ""} onChange={(dataUrl) => set("featuredImage", dataUrl)} />
        </FormGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Category">
            <Select
              value={form.category}
              onChange={(e) => {
                set("category", e.target.value)
                set("subCategory", "")
              }}
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Subcategory" hint={!selectedCategoryId ? "Select a category first." : undefined}>
            <Select
              value={form.subCategory}
              onChange={(e) => set("subCategory", e.target.value)}
              disabled={!selectedCategoryId}
            >
              <option value="">Select subcategory…</option>
              {subCategories.map((sc) => (
                <option key={sc.id} value={sc.name}>
                  {sc.name}
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

        <FormGroup label="Excerpt" hint="Shown on the blog listing. Leave blank to auto-generate from the content.">
          <Textarea rows={2} placeholder="Short teaser for this post…" value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
        </FormGroup>

        <FormGroup label="Content" required hint="Use the toolbar for headings, bold, color, alignment, and lists.">
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

      <div className="bg-card border border-border rounded-xl p-[30px] mb-6">
        <h2 className="font-heading text-[19px] text-navy mb-5">SEO Settings</h2>

        <FormGroup label="Meta Title (Optional)" hint="If empty, the post title will be used">
          <Input placeholder="Title for search engines" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
        </FormGroup>

        <FormGroup label="Meta Description (Optional)" hint="If empty, the excerpt will be used">
          <Textarea rows={2} placeholder="Description for search engines" value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
        </FormGroup>

        <FormGroup label="Meta Keywords (Optional)" hint="Comma-separated keywords for search engines." className="mb-0">
          <Input placeholder="ucp 600, documentary credit, trade finance" value={form.metaKeywords} onChange={(e) => set("metaKeywords", e.target.value)} />
        </FormGroup>
      </div>

      <div className="flex gap-2 mt-2">
        <Button disabled={isSaving} onClick={openPreview}>
          Preview
        </Button>
        {editingId && form.slug && (
          <a
            href={`/blogs/${form.slug}`}
            target="_blank"
            rel="noreferrer"
            title="Opens the real post page in a new tab, showing the last saved version — not your unsaved edits above."
            className="inline-flex items-center px-4 py-2 rounded-sm text-[13px] font-semibold border border-border bg-white hover:bg-muted transition-colors"
          >
            View Live Preview
          </a>
        )}
        <Button variant="secondary" disabled={isSaving} onClick={() => handleSubmit("DRAFT")}>
          {isSaving ? "Saving…" : "Save as draft"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-background rounded-xl w-full max-w-[900px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-navy text-white px-6 py-3.5">
              <span className="text-[13px] font-semibold">
                Preview — this is exactly how readers will see the post. It isn&apos;t published yet.
              </span>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                  Back to Edit
                </Button>
                <Button
                  size="sm"
                  disabled={isSaving}
                  onClick={() => {
                    setShowPreview(false)
                    handleSubmit("PUBLISHED")
                  }}
                >
                  {isSaving ? "Publishing…" : "Confirm & Publish"}
                </Button>
              </div>
            </div>
            <div className="max-h-[80vh] overflow-y-auto">
              <PostView
                title={form.title || "Untitled post"}
                category={form.category}
                subCategory={form.subCategory}
                author={session?.user?.name ?? "IIT Admin"}
                readingTime={form.readingTime ?? estimatePreviewReadingTime(form.content)}
                publishedAt={null}
                featuredImage={form.featuredImage}
                content={form.content}
                showBackLink={false}
              />
            </div>
          </div>
        </div>
      )}
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
