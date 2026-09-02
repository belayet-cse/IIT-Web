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
import {
  ApiError,
  createCategory,
  deleteCategory,
  getCategories,
  reorderCategories,
  updateCategory,
  type Category,
} from "@/lib/api"

function CategoryRow({
  category,
  token,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onChanged,
}: {
  category: Category
  token: string
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onChanged: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function handleRename() {
    if (!name.trim() || name.trim() === category.name) {
      setEditing(false)
      setName(category.name)
      return
    }
    setBusy(true)
    setError("")
    try {
      await updateCategory(token, category.id, name.trim())
      setEditing(false)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to rename category.")
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete category "${category.name}"? Posts using it keep their category text, but it won't be selectable anymore.`)) return
    setBusy(true)
    setError("")
    try {
      await deleteCategory(token, category.id)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete category.")
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-[#f1f2f5] last:border-b-0">
      <div className="flex flex-col gap-0.5">
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

      <div className="flex-1">
        {editing ? (
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="max-w-[280px]"
          />
        ) : (
          <span className="text-[13.5px] font-semibold text-navy">{category.name}</span>
        )}
        {error && <p className="text-[12px] text-destructive mt-1">{error}</p>}
      </div>

      <div className="flex gap-2">
        {editing ? (
          <>
            <Button size="sm" disabled={busy} onClick={handleRename}>
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setEditing(false)
                setName(category.name)
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setEditing(true)}>
              Rename
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

export default function AdminCategoriesPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    getCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timeout = setTimeout(load, 0)
    return () => clearTimeout(timeout)
  }, [load])

  async function handleCreate() {
    if (!token || !newName.trim()) return
    setCreating(true)
    setError("")
    try {
      await createCategory(token, newName.trim())
      setNewName("")
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create category.")
    } finally {
      setCreating(false)
    }
  }

  async function move(index: number, direction: -1 | 1) {
    if (!token) return
    const next = [...categories]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setCategories(next)
    try {
      await reorderCategories(token, next.map((c) => c.id))
    } catch {
      load()
    }
  }

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} />}>
        <Topbar title="Categories" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} />}>
      <Topbar
        title="Categories"
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
          These categories appear in the blog editor&apos;s Category dropdown. Use the arrows to control the order
          they&apos;re shown in — to writers here, and to readers wherever categories are listed on the site.
        </p>

        <div className="flex gap-2 mb-5">
          <Input
            placeholder="New category name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button disabled={creating || !newName.trim()} onClick={handleCreate}>
            {creating ? "Adding…" : "Add Category"}
          </Button>
        </div>
        {error && <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>}

        {loading ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {categories.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13.5px] text-muted-foreground">No categories yet.</p>
            ) : (
              categories.map((category, index) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  token={token}
                  isFirst={index === 0}
                  isLast={index === categories.length - 1}
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
