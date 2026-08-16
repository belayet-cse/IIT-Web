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
  createPartner,
  deletePartner,
  getPartners,
  reorderPartners,
  updatePartner,
  type Partner,
} from "@/lib/api"

function PartnerRow({
  partner,
  token,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onChanged,
}: {
  partner: Partner
  token: string
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onChanged: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(partner.name)
  const [logoUrl, setLogoUrl] = useState(partner.logoUrl)
  const [websiteUrl, setWebsiteUrl] = useState(partner.websiteUrl ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    setBusy(true)
    setError("")
    try {
      await updatePartner(token, partner.id, {
        name: name.trim(),
        logoUrl: logoUrl.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
      })
      setEditing(false)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save partner.")
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Remove "${partner.name}" from the partners list?`)) return
    setBusy(true)
    setError("")
    try {
      await deletePartner(token, partner.id)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete partner.")
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

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={partner.logoUrl} alt="" className="w-10 h-10 object-contain rounded border border-border bg-white flex-shrink-0" />

      <div className="flex-1">
        {editing ? (
          <div className="flex flex-col gap-2 max-w-[420px]">
            <Input autoFocus placeholder="Partner name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            <Input placeholder="Website URL (optional)" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
          </div>
        ) : (
          <div>
            <span className="text-[13.5px] font-semibold text-navy block">{partner.name}</span>
            {partner.websiteUrl && (
              <a href={partner.websiteUrl} target="_blank" rel="noreferrer" className="text-[12px] text-gold hover:underline">
                {partner.websiteUrl}
              </a>
            )}
          </div>
        )}
        {error && <p className="text-[12px] text-destructive mt-1">{error}</p>}
      </div>

      <div className="flex gap-2">
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
                setName(partner.name)
                setLogoUrl(partner.logoUrl)
                setWebsiteUrl(partner.websiteUrl ?? "")
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
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border text-red-700 border-red-200 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminPartnersPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newLogoUrl, setNewLogoUrl] = useState("")
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    getPartners()
      .then(setPartners)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timeout = setTimeout(load, 0)
    return () => clearTimeout(timeout)
  }, [load])

  async function handleCreate() {
    if (!token || !newName.trim() || !newLogoUrl.trim()) return
    setCreating(true)
    setError("")
    try {
      await createPartner(token, {
        name: newName.trim(),
        logoUrl: newLogoUrl.trim(),
        websiteUrl: newWebsiteUrl.trim() || undefined,
      })
      setNewName("")
      setNewLogoUrl("")
      setNewWebsiteUrl("")
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add partner.")
    } finally {
      setCreating(false)
    }
  }

  async function move(index: number, direction: -1 | 1) {
    if (!token) return
    const next = [...partners]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setPartners(next)
    try {
      await reorderPartners(token, next.map((p) => p.id))
    } catch {
      load()
    }
  }

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} />}>
        <Topbar title="Partners" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Partners" />}>
      <Topbar
        title="Partners"
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

      <div className="p-8 flex-1 max-w-[680px]">
        <p className="text-[13px] text-muted-foreground mb-5">
          These partners appear in the &quot;Partners &amp; Collaborators&quot; section on the public About page. Use
          the arrows to control display order.
        </p>

        <div className="flex flex-col gap-2 mb-5 max-w-[420px]">
          <Input placeholder="Partner name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input placeholder="Logo URL" value={newLogoUrl} onChange={(e) => setNewLogoUrl(e.target.value)} />
          <Input placeholder="Website URL (optional)" value={newWebsiteUrl} onChange={(e) => setNewWebsiteUrl(e.target.value)} />
          <Button disabled={creating || !newName.trim() || !newLogoUrl.trim()} onClick={handleCreate}>
            {creating ? "Adding…" : "Add Partner"}
          </Button>
        </div>
        {error && <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>}

        {loading ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {partners.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13.5px] text-muted-foreground">No partners yet.</p>
            ) : (
              partners.map((partner, index) => (
                <PartnerRow
                  key={partner.id}
                  partner={partner}
                  token={token}
                  isFirst={index === 0}
                  isLast={index === partners.length - 1}
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
