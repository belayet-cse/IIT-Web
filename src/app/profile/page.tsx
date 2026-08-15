"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormGroup } from "@/components/forms/form-group"
import { ApiError, changeMyPassword, getMyProfile, updateMyProfile, type MyProfile } from "@/lib/api"

function PersonalInfoCard({ token, profile, onSaved }: { token: string; profile: MyProfile; onSaved: (p: MyProfile) => void }) {
  const [name, setName] = useState(profile.name)
  const [phone, setPhone] = useState(profile.phone ?? "")
  const [address, setAddress] = useState(profile.address ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    setError("")
    setSuccess(false)
    setIsSaving(true)
    try {
      const updated = await updateMyProfile(token, { name, phone, address })
      onSaved(updated)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update profile.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-[30px] mb-6">
      <h2 className="font-heading text-[19px] text-navy mb-1">Personal Information</h2>
      <p className="text-[13px] text-muted-foreground mb-6">Update your personal details and contact information</p>

      {error && <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-5">{error}</p>}
      {success && (
        <p className="text-[13px] text-success-text bg-success-bg rounded-lg px-3.5 py-2.5 mb-5">Profile updated.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup label="Full Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormGroup>
        <FormGroup label="Email Address" hint="Contact support to change your email.">
          <Input value={profile.email} disabled />
        </FormGroup>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup label="Phone Number">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +880 1XXX-XXXXXX" />
        </FormGroup>
        <FormGroup label="Address">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your full address" />
        </FormGroup>
      </div>
      <Button disabled={isSaving} onClick={handleSave}>
        {isSaving ? "Saving…" : "Save Changes"}
      </Button>
    </div>
  )
}

function ChangePasswordCard({ token }: { token: string }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    setError("")
    setSuccess(false)
    if (!currentPassword || !newPassword) {
      setError("Please fill in both password fields.")
      return
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.")
      return
    }
    setIsSaving(true)
    try {
      await changeMyPassword(token, { currentPassword, newPassword })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to change password.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-[30px]">
      <h2 className="font-heading text-[19px] text-navy mb-1">Change Password</h2>
      <p className="text-[13px] text-muted-foreground mb-6">
        Update your password to keep your account secure (leave blank to keep current password)
      </p>

      {error && <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-5">{error}</p>}
      {success && (
        <p className="text-[13px] text-success-text bg-success-bg rounded-lg px-3.5 py-2.5 mb-5">Password changed.</p>
      )}

      <FormGroup label="Current Password">
        <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter your current password" />
      </FormGroup>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormGroup label="New Password">
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter your new password" />
        </FormGroup>
        <FormGroup label="Confirm New Password">
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your new password" />
        </FormGroup>
      </div>
      <Button disabled={isSaving} onClick={handleSave}>
        {isSaving ? "Updating…" : "Update Password"}
      </Button>
    </div>
  )
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const token = session?.accessToken

  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    getMyProfile(token)
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <>
        <TopNav />
        <main className="pt-20 min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
          Loading…
        </main>
        <Footer />
      </>
    )
  }

  if (status !== "authenticated" || !token || !profile) {
    return (
      <>
        <TopNav />
        <main className="pt-20 min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
          Please sign in to view your profile.
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <TopNav />
      <main className="pt-20">
        <section className="py-14">
          <div className="max-w-[820px] mx-auto px-6">
            <h1 className="font-heading text-[30px] text-navy mb-1">Profile Settings</h1>
            <p className="text-sm text-muted-foreground mb-8">Manage your account information and security</p>

            <PersonalInfoCard token={token} profile={profile} onSaved={setProfile} />
            <ChangePasswordCard token={token} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
