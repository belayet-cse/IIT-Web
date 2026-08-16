"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { CheckCircle } from "lucide-react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { SectionHeader } from "@/components/shared/section-header"
import { FormCard } from "@/components/forms/form-card"
import { FormGroup } from "@/components/forms/form-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  ApiError,
  getMyResearcherApplication,
  submitResearcherApplication,
  type MyResearcherApplicationStatus,
} from "@/lib/api"

const benefits = [
  {
    icon: "💰",
    title: "Revenue Share",
    description: "Earn a share of revenue for the Q&As and research content you contribute.",
  },
  {
    icon: "🎓",
    title: "Expert Visibility",
    description: "Get featured as a subject-matter expert to thousands of trade professionals.",
  },
  {
    icon: "💬",
    title: "Q&A Involvement",
    description: "Answer questions assigned by our team in your area of expertise.",
  },
  {
    icon: "🕘",
    title: "Flexible Commitment",
    description: "Contribute on your own schedule — no fixed hours required.",
  },
]

const steps = [
  { title: "Apply", description: "Submit your background, expertise, and a short bio." },
  { title: "Review", description: "Our team reviews your application, typically within a few days." },
  { title: "Get Started", description: "Once approved, your account is upgraded and you're ready to contribute." },
]

const emptyForm = {
  name: "",
  email: "",
  organization: "",
  currentRole: "",
  certifications: "",
  expertiseAreas: "",
  bio: "",
  linkedinUrl: "",
}

function ApplicationForm() {
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function set<K extends keyof typeof emptyForm>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.organization.trim() || !form.currentRole.trim() || !form.bio.trim()) {
      setError("Please fill in all required fields.")
      return
    }
    setError("")
    setIsSaving(true)
    try {
      await submitResearcherApplication({
        name: form.name.trim(),
        email: form.email.trim(),
        organization: form.organization.trim(),
        currentRole: form.currentRole.trim(),
        certifications: form.certifications.split(",").map((c) => c.trim()).filter(Boolean),
        expertiseAreas: form.expertiseAreas.split(",").map((e) => e.trim()).filter(Boolean),
        bio: form.bio.trim(),
        linkedinUrl: form.linkedinUrl.trim() || undefined,
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (success) {
    return (
      <FormCard className="text-center py-14">
        <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8" style={{ color: "var(--success-text)" }} />
        </div>
        <h3 className="font-heading text-[22px] text-navy mb-2">Application submitted!</h3>
        <p className="text-sm text-muted-foreground max-w-[400px] mx-auto">
          Thanks for applying. Our team will review your application and follow up by email, typically
          within a few business days.
        </p>
      </FormCard>
    )
  }

  return (
    <FormCard>
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-5">{error}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
          <FormGroup label="Full Name" required>
            <Input placeholder="e.g. Dr. Nasreen Chowdhury" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </FormGroup>
          <FormGroup label="Email" required>
            <Input type="email" placeholder="you@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </FormGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
          <FormGroup label="Organization" required>
            <Input placeholder="e.g. XYZ Bank" value={form.organization} onChange={(e) => set("organization", e.target.value)} />
          </FormGroup>
          <FormGroup label="Current Role" required>
            <Input placeholder="e.g. Head of Trade Finance" value={form.currentRole} onChange={(e) => set("currentRole", e.target.value)} />
          </FormGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
          <FormGroup label="Certifications" hint="Comma-separated, e.g. CDCS, CSDG">
            <Input placeholder="CDCS, CSDG" value={form.certifications} onChange={(e) => set("certifications", e.target.value)} />
          </FormGroup>
          <FormGroup label="Expertise Areas" hint="Comma-separated, e.g. Trade Finance, Documentary Credits">
            <Input placeholder="Trade Finance, Digital Trade" value={form.expertiseAreas} onChange={(e) => set("expertiseAreas", e.target.value)} />
          </FormGroup>
        </div>

        <FormGroup label="LinkedIn URL">
          <Input type="url" placeholder="https://www.linkedin.com/in/yourname" value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} />
        </FormGroup>

        <FormGroup label="Short Bio" required hint="A few sentences about your background and expertise.">
          <Textarea rows={4} placeholder="Tell us about your experience in trade finance…" value={form.bio} onChange={(e) => set("bio", e.target.value)} />
        </FormGroup>

        <Button type="submit" disabled={isSaving} className="w-full py-3.5 text-[14px]">
          {isSaving ? "Submitting…" : "Submit Application"}
        </Button>
      </form>
    </FormCard>
  )
}

function StatusCard({ application }: { application: MyResearcherApplicationStatus }) {
  const labels: Record<MyResearcherApplicationStatus["status"], string> = {
    PENDING: "Your application is under review.",
    APPROVED: "Your application has been approved — welcome aboard!",
    REJECTED: "Your application was not approved this time.",
  }
  return (
    <FormCard className="text-center py-14">
      <h3 className="font-heading text-[22px] text-navy mb-2">Application {application.status.toLowerCase()}</h3>
      <p className="text-sm text-muted-foreground max-w-[400px] mx-auto mb-2">{labels[application.status]}</p>
      {application.reviewNote && (
        <p className="text-[13px] text-muted-foreground max-w-[400px] mx-auto italic">
          &ldquo;{application.reviewNote}&rdquo;
        </p>
      )}
    </FormCard>
  )
}

export default function ResearcherPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [application, setApplication] = useState<MyResearcherApplicationStatus | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!token) {
        setChecked(true)
        return
      }
      getMyResearcherApplication(token)
        .then(setApplication)
        .catch(() => {})
        .finally(() => setChecked(true))
    }, 0)
    return () => clearTimeout(timeout)
  }, [token])

  return (
    <>
      <TopNav />
      <main className="pt-20">
        {/* Header */}
        <section className="py-16 bg-background">
          <div className="max-w-[760px] mx-auto px-6 text-center">
            <h1 className="font-heading text-[34px] text-navy mb-4">Become an IIT Researcher</h1>
            <p className="text-base text-muted-foreground">
              Share your trade finance expertise with our community, answer member questions, and earn a
              share of the revenue your contributions generate.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-card">
          <div className="max-w-[1180px] mx-auto px-8">
            <SectionHeader eyebrow="Why Join" title="Researcher Benefits" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[18px]">
              {benefits.map((b) => (
                <div key={b.title} className="bg-background border border-border rounded-lg p-6 text-center">
                  <div className="text-3xl mb-3" aria-hidden>
                    {b.icon}
                  </div>
                  <h3 className="text-[14px] font-semibold text-navy mb-1.5">{b.title}</h3>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-background">
          <div className="max-w-[1180px] mx-auto px-8">
            <SectionHeader eyebrow="Process" title="How It Works" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] max-w-[880px] mx-auto">
              {steps.map((step, i) => (
                <div key={step.title} className="text-center">
                  <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center mx-auto mb-3 text-[14px] font-bold">
                    {i + 1}
                  </div>
                  <h3 className="text-[14px] font-semibold text-navy mb-1.5">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application form */}
        <section className="py-16 bg-card">
          <div className="max-w-[720px] mx-auto px-6">
            <SectionHeader eyebrow="Apply" title="Researcher Application" className="mb-10" />
            {!checked ? (
              <p className="text-sm text-muted-foreground text-center py-10">Loading…</p>
            ) : application ? (
              <StatusCard application={application} />
            ) : (
              <ApplicationForm />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
