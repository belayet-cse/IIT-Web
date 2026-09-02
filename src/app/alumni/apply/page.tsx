"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { CheckCircle } from "lucide-react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { ProgressDots } from "@/components/ui/progress-dots"
import { FormCard } from "@/components/forms/form-card"
import { FormGroup } from "@/components/forms/form-group"
import { FormSectionLabel } from "@/components/forms/form-section-label"
import { UploadBox } from "@/components/forms/upload-box"
import { InfoNote } from "@/components/forms/info-note"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  ApiError,
  getMyApplication,
  submitAlumniApplication,
  type ApplicationFormFields,
  type MyApplicationStatus,
} from "@/lib/api"

const initialForm: ApplicationFormFields = {
  fullName: "",
  email: "",
  phone: "",
  linkedin: "",
  designation: "",
  organization: "",
  certification: "",
  yearCompleted: "",
}

export default function AlumniApplyPage() {
  const { data: session, status } = useSession()
  const [form, setForm] = useState<ApplicationFormFields>(initialForm)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [existingApplication, setExistingApplication] = useState<MyApplicationStatus | null>(null)
  const [checkedExisting, setCheckedExisting] = useState(false)

  // Prefill from the signed-in account, if any.
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || session.user!.name || "",
      email: prev.email || session.user!.email || "",
    }))
  }, [status, session])

  // A signed-in user with a pending application shouldn't be re-submitting the form.
  useEffect(() => {
    if (status !== "authenticated" || !session?.accessToken) {
      setCheckedExisting(true)
      return
    }
    getMyApplication(session.accessToken)
      .then(setExistingApplication)
      .catch(() => setExistingApplication(null))
      .finally(() => setCheckedExisting(true))
  }, [status, session?.accessToken])

  function set<K extends keyof ApplicationFormFields>(field: K, value: ApplicationFormFields[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.phone || !form.designation || !form.organization || !form.certification || !form.yearCompleted) {
      setError("Please fill in all required fields.")
      return
    }
    if (!agreed) {
      setError("You must confirm the Alumni Code of Professionalism to continue.")
      return
    }
    setError("")
    setIsLoading(true)
    try {
      await submitAlumniApplication(form, proofFile)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <TopNav />
        <main className="pt-20 bg-background min-h-screen">
          <div className="max-w-[600px] mx-auto px-6 py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" style={{ color: "var(--success-text)" }} />
            </div>
            <h2 className="font-heading text-[28px] text-navy mb-3">Application submitted!</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Thanks for applying, {form.fullName}. IITrade admin will review your application and
              respond within 3–5 business days.
            </p>
            <Link
              href="/alumni"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-sm px-6 py-3 text-[14px] font-semibold hover:bg-primary/90 transition-opacity"
            >
              Back to Alumni Network →
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const isAlumniAlready = session?.user?.role === "ALUMNI" || session?.user?.role === "ADMIN"
  const hasPendingApplication = existingApplication?.status === "PENDING"

  if (checkedExisting && (isAlumniAlready || hasPendingApplication)) {
    return (
      <>
        <TopNav />
        <main className="pt-20 bg-background min-h-screen">
          <div className="max-w-[560px] mx-auto px-6 py-24 text-center">
            <h2 className="font-heading text-[28px] text-navy mb-3">
              {isAlumniAlready ? "You're already an alumni member" : "Application already submitted"}
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              {isAlumniAlready
                ? "There's no need to apply again — you already have full alumni access."
                : `Your application is still under review${
                    existingApplication ? ` (submitted ${new Date(existingApplication.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})` : ""
                  }. IITrade admin typically responds within 3–5 business days.`}
            </p>
            <Link
              href="/alumni"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-sm px-6 py-3 text-[14px] font-semibold hover:bg-primary/90 transition-opacity"
            >
              Back to Alumni Network →
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <TopNav />
      <main className="pt-20 bg-background min-h-screen">
        <div className="max-w-[820px] mx-auto px-6 py-14 pb-20">

          <Link
            href="/alumni"
            className="inline-block mb-5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Alumni Network
          </Link>

          {/* Page header */}
          <div className="text-center mb-9">
            <span className="text-eyebrow text-gold block mb-[14px]">Alumni Application</span>
            <h1 className="font-heading text-[32px] text-navy mb-[10px]">
              Apply for Alumni Membership
            </h1>
            <p className="text-sm text-muted-foreground max-w-[520px] mx-auto">
              Membership is open to trade finance and trade services professionals who have completed
              an IITrade certification or program. Applications are reviewed by IITrade admin, typically within
              3–5 business days.
            </p>
          </div>

          <ProgressDots steps={3} current={2} className="mb-10" />

          <form onSubmit={handleSubmit} noValidate>
          <FormCard>

            {error && (
              <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-5">
                {error}
              </p>
            )}

            {/* Personal Information */}
            <FormSectionLabel>Personal Information</FormSectionLabel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
              <FormGroup label="Full Name" required>
                <Input
                  type="text"
                  placeholder="e.g. Rafiq Ahmed"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Email Address" required>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </FormGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
              <FormGroup label="Phone Number" required>
                <Input
                  type="tel"
                  placeholder="+880 1XXX-XXXXXX"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </FormGroup>
              <FormGroup label="LinkedIn Profile">
                <Input
                  type="url"
                  placeholder="linkedin.com/in/yourname"
                  value={form.linkedin}
                  onChange={(e) => set("linkedin", e.target.value)}
                />
              </FormGroup>
            </div>

            {/* Professional Background */}
            <FormSectionLabel>Professional Background</FormSectionLabel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
              <FormGroup label="Current Designation" required>
                <Input
                  type="text"
                  placeholder="e.g. Trade Finance Manager"
                  value={form.designation}
                  onChange={(e) => set("designation", e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Organization" required>
                <Input
                  type="text"
                  placeholder="e.g. Standard Bank"
                  value={form.organization}
                  onChange={(e) => set("organization", e.target.value)}
                />
              </FormGroup>
            </div>

            {/* IITrade Certification */}
            <FormSectionLabel>IITrade Certification / Program</FormSectionLabel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
              <FormGroup label="Certification Completed" required>
                <Select
                  value={form.certification}
                  onChange={(e) => set("certification", e.target.value)}
                >
                  <option value="">Select certification</option>
                  <option value="CDCS">CDCS</option>
                  <option value="CSDG">CSDG</option>
                  <option value="CITF">CITF</option>
                  <option value="CTFP">CTFP</option>
                  <option value="OTHER">Other IITrade Program</option>
                </Select>
              </FormGroup>
              <FormGroup label="Year Completed" required>
                <Input
                  type="text"
                  placeholder="e.g. 2023"
                  value={form.yearCompleted}
                  onChange={(e) => set("yearCompleted", e.target.value)}
                />
              </FormGroup>
            </div>

            <FormGroup label="Upload Certificate / Proof of Completion">
              <UploadBox hint="PDF, JPG, PNG (max 5MB)" onChange={setProofFile} />
              {proofFile && (
                <p className="text-[12px] text-muted-foreground mt-1.5">Selected: {proofFile.name}</p>
              )}
            </FormGroup>

            {/* Charter Note */}
            <FormSectionLabel>A Note on Membership</FormSectionLabel>

            <InfoNote>
              Alumni membership connects you to <b>mentorship</b>,{" "}
              <b>structured networking</b> across institutions and generations, and access to
              best-practice publications developed by the IITrade Alumni community. Members are expected
              to uphold the Alumni Code of Professionalism and participate in at least one Alumni
              initiative where feasible. Read the full{" "}
              <a href="/alumni/charter">Alumni Charter</a>.
            </InfoNote>

            {/* Consent */}
            <label className="flex gap-[10px] items-start text-[12.5px] text-muted-foreground mt-6 mb-6 cursor-pointer">
              <input
                type="checkbox"
                className="mt-[3px] accent-navy"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              I confirm the information above is accurate and I agree to uphold the IITrade Alumni
              Code of Professionalism.
            </label>

            <Button type="submit" disabled={isLoading} className="w-full py-3.5 text-[14px]">
              {isLoading ? "Submitting…" : "Submit Application for Review"}
            </Button>

          </FormCard>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
