"use client"

import { useEffect, useState } from "react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/shared/hero"
import { Select } from "@/components/ui/select"
import { ProgramCard } from "@/components/cards/program-card"
import { ApiError, getPrograms, type ProgramListResult, type ProgramType } from "@/lib/api"

export default function ProgramsPage() {
  const [type, setType] = useState<ProgramType | "">("")
  const [result, setResult] = useState<ProgramListResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true)
      setError("")
      getPrograms({ type: type || undefined })
        .then(setResult)
        .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load programs."))
        .finally(() => setLoading(false))
    }, 0)
    return () => clearTimeout(timeout)
  }, [type])

  return (
    <>
      <TopNav />
      <main className="pt-20">
        <Hero
          eyebrow="Certification Programs"
          title="Certification Programs"
          subtitle="Comprehensive training and certification programs designed by industry leaders and experts."
        />

        <section className="py-16">
          <div className="max-w-[1180px] mx-auto px-6">
            <div className="max-w-[280px] mx-auto mb-10">
              <Select value={type} onChange={(e) => setType(e.target.value as ProgramType | "")}>
                <option value="">All types</option>
                <option value="INTERNATIONAL">International</option>
                <option value="PROPRIETARY">Proprietary</option>
              </Select>
            </div>

            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-10">Loading…</p>
            ) : error ? (
              <p className="text-center text-sm text-destructive py-10">{error}</p>
            ) : result && result.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
                {result.data.map((program) => (
                  <ProgramCard
                    key={program.slug}
                    code={program.code ?? program.title}
                    title={program.type === "INTERNATIONAL" ? "International Certification" : "Proprietary Certification"}
                    description={program.overview}
                    href={`/programs/${program.slug}`}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-10">No certification programs published yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
