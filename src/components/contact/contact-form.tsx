"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { FormCard } from "@/components/forms/form-card"
import { FormGroup } from "@/components/forms/form-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ApiError, submitContactInquiry } from "@/lib/api"

const categories = ["General Inquiry", "Program Information", "Resource Request"]

const emptyForm = { name: "", email: "", phone: "", subject: "", message: "" }

export function ContactForm() {
  const searchParams = useSearchParams()
  const [category, setCategory] = useState(categories[0])
  const [form, setForm] = useState(() => ({ ...emptyForm, subject: searchParams.get("subject") ?? "" }))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function set<K extends keyof typeof emptyForm>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError("Please fill in all required fields.")
      return
    }
    setError("")
    setIsSaving(true)
    try {
      await submitContactInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        category,
        subject: form.subject.trim(),
        message: form.message.trim(),
      })
      setSuccess(true)
      setForm(emptyForm)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (success) {
    return (
      <FormCard className="text-center py-14">
        <h3 className="font-heading text-[22px] text-navy mb-2">Message sent!</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Thanks for reaching out — we&apos;ll get back to you within 1–2 business days.
        </p>
        <Button variant="outline" onClick={() => setSuccess(false)}>
          Send Another Message
        </Button>
      </FormCard>
    )
  }

  return (
    <FormCard>
      <h3 className="font-heading text-[22px] text-navy mb-1">Get in Touch</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Fill out the form below and we&apos;ll get back to you as soon as possible.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              "text-[12.5px] font-semibold px-3.5 py-2 rounded-full border transition-colors",
              category === c
                ? "bg-navy text-white border-navy"
                : "border-border text-muted-foreground hover:border-gold hover:text-gold"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-5">{error}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
          <FormGroup label="Full Name" required>
            <Input placeholder="John Doe" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </FormGroup>
          <FormGroup label="Email" required>
            <Input
              type="email"
              placeholder="john.doe@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </FormGroup>
        </div>

        <FormGroup label="Phone (Optional)">
          <Input
            type="tel"
            placeholder="+880 1XXX-XXXXXX"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </FormGroup>

        <FormGroup label="Subject" required>
          <Input
            placeholder="Inquiry about programs"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
          />
        </FormGroup>

        <FormGroup label="Message" required>
          <Textarea
            rows={5}
            placeholder="Please describe your inquiry in detail…"
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
          />
        </FormGroup>

        <Button type="submit" disabled={isSaving} className="w-full py-3.5 text-[14px]">
          {isSaving ? "Sending…" : "Submit Inquiry"}
        </Button>
      </form>
    </FormCard>
  )
}
