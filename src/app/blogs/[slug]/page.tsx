"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Eyebrow } from "@/components/shared/eyebrow"
import { ApiError, getBlogBySlug, type PublicBlogDetail } from "@/lib/api"

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug

  const [post, setPost] = useState<PublicBlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true)
      setNotFound(false)
      getBlogBySlug(slug)
        .then(setPost)
        .catch((err) => {
          if (err instanceof ApiError && err.status === 404) setNotFound(true)
        })
        .finally(() => setLoading(false))
    }, 0)
    return () => clearTimeout(timeout)
  }, [slug])

  if (loading) {
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

  if (notFound || !post) {
    return (
      <>
        <TopNav />
        <main className="pt-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
          <h1 className="font-heading text-[26px] text-navy mb-2">Post not found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This blog post doesn&apos;t exist or is no longer published.
          </p>
          <Link href="/blogs" className="text-gold text-nav hover:underline">
            ← Back to all posts
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const paragraphs = post.content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)

  return (
    <>
      <TopNav />
      <main className="pt-20">
        <section
          className="relative overflow-hidden text-white text-center py-[64px] pb-[44px]"
          style={{
            background:
              "linear-gradient(160deg, rgba(10,18,41,.94), rgba(10,18,41,.86)), radial-gradient(circle at 80% 20%, rgba(201,168,76,.18), transparent 55%)",
          }}
        >
          <div className="relative z-10 max-w-[760px] mx-auto px-6">
            {post.category && <Eyebrow variant="light">{post.category}</Eyebrow>}
            <h1 className="font-heading text-[34px] font-bold text-white mb-4 leading-tight">{post.title}</h1>
            <div className="flex items-center justify-center gap-2 text-[13px]" style={{ color: "#c7cbe0" }}>
              <span>{post.author}</span>
              <span aria-hidden>·</span>
              <span>{post.readingTime} min read</span>
              {post.publishedAt && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        </section>

        <article className="py-16">
          <div className="max-w-[720px] mx-auto px-6">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="text-[16px] leading-[1.75] text-foreground mb-5">
                {paragraph}
              </p>
            ))}

            <div className="mt-12 pt-8 border-t border-border">
              <Link href="/blogs" className="text-gold text-nav hover:underline">
                ← Back to all posts
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
