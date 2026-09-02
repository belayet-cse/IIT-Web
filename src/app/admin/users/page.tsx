"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { AdminShell } from "@/components/layout/admin-shell"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { DataTable } from "@/components/admin/data-table"
import { adminNavGroups } from "@/components/admin/admin-nav"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { FormGroup } from "@/components/forms/form-group"
import {
  ApiError,
  getAdminUsers,
  updateAdminUser,
  type AdminUserRow,
  type UserRole,
} from "@/lib/api"

const ROLE_OPTIONS: UserRole[] = ["GENERAL", "PREMIUM", "ALUMNI", "RESEARCHER", "ADMIN"]

function initialsOf(name: string) {
  return name.trim().slice(0, 2) || "?"
}

function usernameOf(email: string) {
  return email.split("@")[0]
}

function EditUserModal({
  token,
  row,
  onClose,
  onSaved,
}: {
  token: string
  row: AdminUserRow
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(row.name)
  const [email, setEmail] = useState(row.email)
  const [phone, setPhone] = useState(row.phone ?? "")
  const [role, setRole] = useState<UserRole>(row.role)
  const [verified, setVerified] = useState(row.emailVerified)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.")
      return
    }
    setIsSaving(true)
    setError("")
    try {
      await updateAdminUser(token, row.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        emailVerified: verified,
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
        <FormGroup label="Full Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormGroup>
        <FormGroup label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormGroup>
        <FormGroup label="Phone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
        </FormGroup>
        <FormGroup label="Role">
          <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </FormGroup>
        <div className="flex items-center justify-between mb-5">
          <span className="text-[13.5px] font-medium text-foreground">Email verified</span>
          <Toggle checked={verified} onChange={setVerified} />
        </div>
        <div className="flex gap-2 mt-2">
          <Button className="flex-1" disabled={isSaving} onClick={handleSave}>
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [search, setSearch] = useState("")
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRow, setEditingRow] = useState<AdminUserRow | null>(null)

  const loadRows = useCallback(() => {
    if (!token) return
    setLoading(true)
    getAdminUsers(token, search || undefined)
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, search])

  useEffect(() => {
    const timeout = setTimeout(loadRows, 250)
    return () => clearTimeout(timeout)
  }, [loadRows])

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="All Users" />}>
        <Topbar title="Users" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="All Users" />}>
      <Topbar
        title="User Management"
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
        <Input
          placeholder="Search by name or email…"
          className="w-[280px] mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
        ) : (
          <DataTable<AdminUserRow>
            emptyMessage="No users found."
            columns={[
              {
                key: "picture",
                header: "Picture",
                render: (row) => <Avatar initials={initialsOf(row.name)} size="sm" />,
              },
              { key: "name", header: "Full Name", render: (row) => <span className="font-semibold text-navy">{row.name}</span> },
              { key: "username", header: "Username", render: (row) => usernameOf(row.email) },
              { key: "email", header: "Email" },
              {
                key: "createdAt",
                header: "Created At",
                render: (row) => new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              },
              { key: "role", header: "Role", render: (row) => <span className="lowercase">{row.role}</span> },
              {
                key: "membership",
                header: "Membership",
                render: (row) =>
                  row.membershipTier ? (
                    <Badge variant="verified">{row.membershipTier}</Badge>
                  ) : row.desiredMembershipTier ? (
                    <Badge variant="pending">Wants {row.desiredMembershipTier}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  ),
              },
              {
                key: "verified",
                header: "Verified",
                render: (row) => <Badge variant={row.emailVerified ? "verified" : "pending"}>{row.emailVerified ? "Yes" : "No"}</Badge>,
              },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                  <Button size="sm" variant="outline" onClick={() => setEditingRow(row)}>
                    Edit
                  </Button>
                ),
              },
            ]}
            data={rows}
          />
        )}
      </div>

      {editingRow && (
        <EditUserModal token={token} row={editingRow} onClose={() => setEditingRow(null)} onSaved={loadRows} />
      )}
    </AdminShell>
  )
}
