"use client"

import { useEffect, useState } from "react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/shared/hero"
import { BlogCard } from "@/components/cards/blog-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ApiError, getBlogs, type BlogListResult } from "@/lib/api"

export default function BlogsPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<BlogListResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const delay = search ? 250 : 0
    const timeout = setTimeout(() => {
      setLoading(true)
      setError("")
      getBlogs({ search, page })
        .then(setResult)
        .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load blog posts."))
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
          eyebrow="Insights"
          title="Blogs"
          subtitle="Industry-recognized articles on UCP 600, documentary credits, and international trade practice."
        />

        <section className="py-16">
          <div className="max-w-[1180px] mx-auto px-6">
            <div className="max-w-[420px] mx-auto mb-10">
              <Input
                placeholder="Search blog posts…"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {result.data.map((post) => (
                    <BlogCard key={post.slug} {...post} />
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
                {search ? "No posts match your search." : "No blog posts published yet."}
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
