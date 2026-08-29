"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/shared/hero"
import { BlogCard } from "@/components/cards/blog-card"
import { FeaturedBlogCard } from "@/components/cards/featured-blog-card"
import { Button } from "@/components/ui/button"
import { ApiError, getBlogs, type BlogListResult } from "@/lib/api"

function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-muted rounded w-4/5" />
        <div className="h-4 bg-muted rounded w-3/5" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    </div>
  )
}

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

  const showFeatured = !loading && !search && page === 1 && result && result.data.length > 0
  const featuredPost = showFeatured ? result.data[0] : null
  const gridPosts = featuredPost ? result!.data.slice(1) : result?.data ?? []

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
            <div className="max-w-[440px] mx-auto mb-12 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                placeholder="Search blog posts…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-full border border-border bg-card text-[14px] shadow-sm transition-shadow focus:outline-none focus:shadow-md focus:border-gold"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <p className="text-center text-sm text-destructive py-10">{error}</p>
            ) : result && result.data.length > 0 ? (
              <>
                {featuredPost && <FeaturedBlogCard {...featuredPost} />}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridPosts.map((post) => (
                    <BlogCard key={post.slug} {...post} />
                  ))}
                </div>

                {result.meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-14">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      ← Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
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
