"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/shared/hero"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ApiError, getResearchPapers, type ResearchPaperListResult, type ResearchPaperSummary } from "@/lib/api"

function ResearchCard({ paper }: { paper: ResearchPaperSummary }) {
  return (
    <Link
      href={`/research/${paper.slug}`}
      className="group relative block bg-card border border-border rounded-xl overflow-hidden hover:border-gold/50 hover:-translate-y-1 transition-all"
    >
      {paper.priceBdt > 0 && (
        <span className="absolute top-3 right-3 z-10 bg-navy text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
          🔒 Members
        </span>
      )}
      {paper.featuredImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={paper.featuredImage} alt="" className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground/40 text-3xl">📄</div>
      )}
      <div className="p-6">
        {paper.category && <span className="text-eyebrow text-gold block mb-2">{paper.category}</span>}
        <h3 className="font-heading text-[19px] text-navy group-hover:text-gold transition-colors mb-2 leading-snug">
          {paper.title}
        </h3>
        <p className="text-[13.5px] text-muted-foreground mb-4 line-clamp-3">{paper.abstract}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{paper.author}</span>
          <span aria-hidden>·</span>
          <span>{paper.readingTime} min read</span>
        </div>
      </div>
    </Link>
  )
}

export default function ResearchPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<ResearchPaperListResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const delay = search ? 250 : 0
    const timeout = setTimeout(() => {
      setLoading(true)
      setError("")
      getResearchPapers({ search, page })
        .then(setResult)
        .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load research papers."))
        .finally(() => setLoading(false))
    }, delay)
    return () => clearTimeout(timeout)
  }, [search, page])

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <>
      <TopNav />
      <main className="pt-20">
        <Hero
          eyebrow="Research"
          title="Research Publications"
          subtitle="Access cutting-edge industry insights, publications, and research from leading trade experts."
        />

        <section className="py-16">
          <div className="max-w-[1180px] mx-auto px-6">
            <div className="max-w-[420px] mx-auto mb-10">
              <Input
                placeholder="Search research papers…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-10">Loading…</p>
            ) : error ? (
              <p className="text-center text-sm text-destructive py-10">{error}</p>
            ) : result && result.data.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
                  {result.data.map((paper) => (
                    <ResearchCard key={paper.slug} paper={paper} />
                  ))}
                </div>

                {result.meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-12">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      ← Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {result.meta.page} of {result.meta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page >= result.meta.totalPages}
                      onClick={() => setPage((p) => Math.min(result.meta.totalPages, p + 1))}
                    >
                      Next →
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-10">
                {search ? "No papers match your search." : "No research papers published yet."}
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
