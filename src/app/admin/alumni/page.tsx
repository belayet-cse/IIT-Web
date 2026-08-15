"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { AdminShell } from "@/components/layout/admin-shell"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { AdminTabs } from "@/components/admin/admin-tabs"
import { DefaultBanner } from "@/components/admin/default-banner"
import { adminNavGroups } from "@/components/admin/admin-nav"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { FormGroup } from "@/components/forms/form-group"
import {
  ApiError,
  approveApplication,
  createHonoraryAlumni,
  fileUrl,
  getAdminDirectory,
  getPendingApplications,
  getPrivilegeDefaults,
  getPrivilegesList,
  rejectApplication,
  updateAlumni,
  updatePrivilegeDefaults,
  updatePrivileges,
  type AdminDirectoryRow,
  type HonoraryFormFields,
  type PendingApplicationRow,
  type PrivilegeDefaults,
  type PrivilegeRow,
} from "@/lib/api"

// ── Sub-components ────────────────────────────────────────────────────────────

function WhoCell({ initials, avatarColor, name, email }: { initials: string; avatarColor?: string; name: string; email: string }) {
  return (
    <div className="flex items-center gap-[10px]">
      <Avatar initials={initials} size="sm" color={avatarColor} />
      <div>
        <div className="font-semibold text-navy text-[13px]">{name}</div>
        <div className="text-[11.5px] text-muted-foreground">{email}</div>
      </div>
    </div>
  )
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr>
        {cols.map((col) => (
          <th key={col} className="text-left text-section-label text-muted-foreground px-5 py-3 border-b border-border bg-background">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  )
}

const tdClass = "px-5 py-[14px] text-[13px] border-b border-[#f1f2f5] last:border-b-0 align-middle"

// ── Tab Panels ─────────────────────────────────────────────────────────────────

function PendingTab({
  token,
  rows,
  loading,
  onRefresh,
}: {
  token: string
  rows: PendingApplicationRow[]
  loading: boolean
  onRefresh: () => void
}) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function handleApprove(id: string) {
    setBusyId(id)
    setError("")
    try {
      await approveApplication(token, id)
      onRefresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to approve application.")
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject(id: string) {
    setBusyId(id)
    setError("")
    try {
      await rejectApplication(token, id)
      onRefresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reject application.")
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>

  return (
    <div>
      {error && (
        <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>
      )}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <TableHeader cols={["Applicant", "Organization", "Certification", "Applied", "Proof", "Actions"]} />
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={6}>
                  <span className="text-muted-foreground">No pending applications.</span>
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                <td className={tdClass}><WhoCell {...row} /></td>
                <td className={tdClass}>{row.org}</td>
                <td className={tdClass}>{row.cert}</td>
                <td className={tdClass}>{row.applied}</td>
                <td className={tdClass}>
                  {row.proofFileUrl ? (
                    <a href={fileUrl(row.proofFileUrl)} target="_blank" rel="noreferrer" className="text-navy font-semibold hover:underline">
                      View file →
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className={tdClass}>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" disabled={busyId === row.id} onClick={() => handleApprove(row.id)}>
                      Approve
                    </Button>
                    <button
                      disabled={busyId === row.id}
                      onClick={() => handleReject(row.id)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border text-red-700 border-red-200 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const CERT_OPTIONS = ["CDCS", "CSDG", "CITF", "CTFP", "OTHER"]

function EditAlumniModal({
  token,
  row,
  onClose,
  onSaved,
}: {
  token: string
  row: AdminDirectoryRow
  onClose: () => void
  onSaved: () => void
}) {
  const [organization, setOrganization] = useState(row.org)
  const [batch, setBatch] = useState(row.batch === "—" ? "" : row.batch)
  const [country, setCountry] = useState("")
  const [certification, setCertification] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    setIsSaving(true)
    setError("")
    try {
      await updateAlumni(token, row.id, {
        organization,
        batch: batch || undefined,
        country: country || undefined,
        certification: certification || undefined,
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save changes.")
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
        <h3 className="font-heading text-[19px] text-navy mb-4">Edit {row.name}</h3>
        {error && (
          <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>
        )}
        <FormGroup label="Organization">
          <Input value={organization} onChange={(e) => setOrganization(e.target.value)} />
        </FormGroup>
        <FormGroup label="Batch">
          <Input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="e.g. 2019" />
        </FormGroup>
        <FormGroup label="Country">
          <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Bangladesh" />
        </FormGroup>
        <FormGroup label="Certification">
          <Select value={certification} onChange={(e) => setCertification(e.target.value)}>
            <option value="">Leave unchanged</option>
            {CERT_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </FormGroup>
        <div className="flex gap-2 mt-2">
          <Button className="flex-1" disabled={isSaving} onClick={handleSave}>
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

function DirectoryTab({
  token,
  rows,
  loading,
  onRefresh,
}: {
  token: string
  rows: AdminDirectoryRow[]
  loading: boolean
  onRefresh: () => void
}) {
  const [editingRow, setEditingRow] = useState<AdminDirectoryRow | null>(null)

  if (loading) return <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>

  return (
    <div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <TableHeader cols={["Alumni", "Organization", "Type", "Batch", "Status", "Actions"]} />
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className={tdClass} colSpan={6}>
                  <span className="text-muted-foreground">No alumni yet.</span>
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}>
                <td className={tdClass}><WhoCell {...row} /></td>
                <td className={tdClass}>{row.org}</td>
                <td className={tdClass}>
                  <Badge variant={row.type}>{row.typeLabel}</Badge>
                </td>
                <td className={tdClass}>{row.batch}</td>
                <td className={tdClass}>
                  <Badge variant={row.status}>Verified</Badge>
                </td>
                <td className={tdClass}>
                  <Button size="sm" variant="outline" onClick={() => setEditingRow(row)}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingRow && (
        <EditAlumniModal
          token={token}
          row={editingRow}
          onClose={() => setEditingRow(null)}
          onSaved={onRefresh}
        />
      )}
    </div>
  )
}

const initialHonoraryForm: HonoraryFormFields = {
  name: "",
  email: "",
  designation: "",
  organization: "",
  bio: "",
}

function HonoraryTab({ token, onCreated }: { token: string; onCreated: () => void }) {
  const [form, setForm] = useState<HonoraryFormFields>(initialHonoraryForm)
  const [photo, setPhoto] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function set<K extends keyof HonoraryFormFields>(field: K, value: HonoraryFormFields[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.designation || !form.organization) {
      setError("Please fill in all required fields.")
      return
    }
    setError("")
    setSuccess(false)
    setIsSaving(true)
    try {
      await createHonoraryAlumni(token, form, photo)
      setForm(initialHonoraryForm)
      setPhoto(null)
      setSuccess(true)
      onCreated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to grant honorary membership.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <p className="text-[12.5px] text-muted-foreground max-w-[560px] mb-5">
        Per Article III.1 of the Alumni Charter, honorary membership is conferred on individuals of distinguished
        industry contribution, whether or not they meet standard eligibility. Adding here grants immediate
        verified alumni access — no application review needed.
      </p>
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-[30px] max-w-[640px]">
        {error && (
          <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-5">{error}</p>
        )}
        {success && (
          <p className="text-[13px] text-success-text bg-success-bg rounded-lg px-3.5 py-2.5 mb-5">
            Honorary membership granted.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Full Name">
            <Input
              type="text"
              placeholder="e.g. Dr. Nasreen Chowdhury"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </FormGroup>
          <FormGroup label="Email">
            <Input
              type="email"
              placeholder="name@email.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </FormGroup>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup label="Current Title / Role">
            <Input
              type="text"
              placeholder="e.g. Former Head of Trade, XYZ Bank"
              value={form.designation}
              onChange={(e) => set("designation", e.target.value)}
            />
          </FormGroup>
          <FormGroup label="Organization">
            <Input
              type="text"
              placeholder="e.g. XYZ Bank"
              value={form.organization}
              onChange={(e) => set("organization", e.target.value)}
            />
          </FormGroup>
        </div>
        <FormGroup label="Reason for Honorary Membership">
          <Textarea
            rows={3}
            placeholder="e.g. 25 years in trade services, contributed to IITrade's founding curriculum…"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Photo">
          <Input
            type="file"
            accept="image/*"
            className="py-2"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
        </FormGroup>
        <Button type="submit" disabled={isSaving} className="w-full py-3">
          {isSaving ? "Granting…" : "Grant Honorary Membership"}
        </Button>
      </form>
    </div>
  )
}

function PrivilegesTab({ token }: { token: string }) {
  const [search, setSearch] = useState("")
  const [rows, setRows] = useState<PrivilegeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [defaults, setDefaults] = useState<PrivilegeDefaults | null>(null)
  const [savingDefaults, setSavingDefaults] = useState(false)

  const loadRows = useCallback(() => {
    setLoading(true)
    getPrivilegesList(token, search)
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, search])

  useEffect(() => {
    const timeout = setTimeout(loadRows, 250)
    return () => clearTimeout(timeout)
  }, [loadRows])

  useEffect(() => {
    getPrivilegeDefaults(token).then(setDefaults).catch(() => {})
  }, [token])

  async function handleSaveDefaults() {
    if (!defaults) return
    setSavingDefaults(true)
    try {
      const updated = await updatePrivilegeDefaults(token, defaults)
      setDefaults(updated)
    } catch {
      // no-op
    } finally {
      setSavingDefaults(false)
    }
  }

  async function patchRow(id: string, data: Partial<PrivilegeRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
    try {
      await updatePrivileges(token, id, data)
    } catch {
      loadRows()
    }
  }

  return (
    <div>
      <DefaultBanner
        title="Default Alumni Privileges"
        description="Applied automatically to every verified alumni member unless overridden individually below."
        actions={
          <>
            <div className="text-center">
              <div className="text-[11px] text-white/60 mb-1">Certifications</div>
              <select
                className="bg-transparent border border-white/30 text-white text-xs rounded px-2 py-1.5 focus:outline-none"
                value={defaults?.certDiscountPercent ?? 20}
                onChange={(e) =>
                  setDefaults((prev) => ({
                    certDiscountPercent: Number(e.target.value),
                    blogDiscountPercent: prev?.blogDiscountPercent ?? 0,
                  }))
                }
              >
                <option value={20}>20% off</option>
                <option value={50}>50% off</option>
                <option value={100}>Free</option>
              </select>
            </div>
            <div className="text-center">
              <div className="text-[11px] text-white/60 mb-1">Blog (paid posts)</div>
              <select
                className="bg-transparent border border-white/30 text-white text-xs rounded px-2 py-1.5 focus:outline-none"
                value={defaults?.blogDiscountPercent ?? 0}
                onChange={(e) =>
                  setDefaults((prev) => ({
                    certDiscountPercent: prev?.certDiscountPercent ?? 20,
                    blogDiscountPercent: Number(e.target.value),
                  }))
                }
              >
                <option value={100}>Free</option>
                <option value={50}>50% off</option>
              </select>
            </div>
            <button
              disabled={savingDefaults}
              onClick={handleSaveDefaults}
              className="border border-white/30 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {savingDefaults ? "Saving…" : "Save Defaults"}
            </button>
          </>
        }
      />

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search alumni to override privileges…"
          className="w-[260px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-xs text-muted-foreground">Individual overrides take priority over defaults</span>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <TableHeader cols={["Alumni", "Certification Discount", "Free Certifications", "Blog Access", "Forum"]} />
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan={5}>
                    <span className="text-muted-foreground">No alumni found.</span>
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className={tdClass}>
                    <WhoCell initials={row.initials} avatarColor={row.avatarColor} name={row.name} email={row.sub} />
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        defaultValue={row.certDiscountPercent}
                        onBlur={(e) => {
                          const value = Number(e.target.value)
                          if (!Number.isNaN(value)) patchRow(row.id, { certDiscountPercent: value })
                        }}
                        className="w-14 border border-border rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-ring"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <select
                      value={row.freeCertifications}
                      onChange={(e) => patchRow(row.id, { freeCertifications: e.target.value })}
                      className="border border-border rounded text-xs px-2 py-1.5 text-foreground bg-card focus:outline-none focus:border-ring"
                    >
                      <option value="none">None selected</option>
                      <option value="first_phase">CDCS – 1st Phase</option>
                      <option value="all">All certifications</option>
                    </select>
                  </td>
                  <td className={tdClass}>
                    <Toggle checked={row.blogAccess} onChange={(v) => patchRow(row.id, { blogAccess: v })} />
                  </td>
                  <td className={tdClass}>
                    <Toggle checked={row.forumAccess} onChange={(v) => patchRow(row.id, { forumAccess: v })} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminAlumniPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [activeTab, setActiveTab] = useState("directory")
  const [activeNav, setActiveNav] = useState("Alumni")

  const [pendingRows, setPendingRows] = useState<PendingApplicationRow[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [directoryRows, setDirectoryRows] = useState<AdminDirectoryRow[]>([])
  const [directoryLoading, setDirectoryLoading] = useState(true)

  const loadPending = useCallback(() => {
    if (!token) return
    setPendingLoading(true)
    getPendingApplications(token, "PENDING")
      .then(setPendingRows)
      .catch(() => {})
      .finally(() => setPendingLoading(false))
  }, [token])

  const loadDirectory = useCallback(() => {
    if (!token) return
    setDirectoryLoading(true)
    getAdminDirectory(token)
      .then(setDirectoryRows)
      .catch(() => {})
      .finally(() => setDirectoryLoading(false))
  }, [token])

  useEffect(() => {
    // Shared with manual refresh handlers below, so the fetch-and-set-loading logic
    // lives in loadPending/loadDirectory rather than being inlined here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPending()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDirectory()
  }, [loadPending, loadDirectory])

  function handleHonoraryCreated() {
    loadDirectory()
  }

  const tabs = [
    { id: "pending", label: "Pending Verification", count: pendingRows.length },
    { id: "directory", label: "Alumni Directory", count: directoryRows.length },
    { id: "honorary", label: "Add Honorary Member" },
    { id: "privileges", label: "Privileges" },
  ]

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem={activeNav} onItemClick={setActiveNav} />}>
        <Topbar title="Alumni" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      sidebar={
        <Sidebar
          navGroups={adminNavGroups}
          activeItem={activeNav}
          onItemClick={setActiveNav}
        />
      }
    >
      <Topbar
        title="Alumni"
        actions={
          <>
            {session?.user?.name && (
              <span className="text-[13px] text-muted-foreground hidden sm:inline">
                {session.user.name}
              </span>
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
        <AdminTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "pending" && (
          <PendingTab token={token} rows={pendingRows} loading={pendingLoading} onRefresh={() => { loadPending(); loadDirectory(); }} />
        )}
        {activeTab === "directory" && (
          <DirectoryTab token={token} rows={directoryRows} loading={directoryLoading} onRefresh={loadDirectory} />
        )}
        {activeTab === "honorary" && <HonoraryTab token={token} onCreated={handleHonoraryCreated} />}
        {activeTab === "privileges" && <PrivilegesTab token={token} />}
      </div>
    </AdminShell>
  )
}
