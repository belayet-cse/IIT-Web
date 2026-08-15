"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { PostView } from "@/components/blog/post-view"
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

  return (
    <>
      <TopNav />
      <main className="pt-20">
        <PostView
          title={post.title}
          category={post.category}
          author={post.author}
          readingTime={post.readingTime}
          publishedAt={post.publishedAt}
          featuredImage={post.featuredImage}
          content={post.content}
        />
      </main>
      <Footer />
    </>
  )
}
