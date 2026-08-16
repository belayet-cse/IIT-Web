"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { PostView } from "@/components/blog/post-view"
import {
  ApiError,
  createBlogCheckout,
  getBlogBySlug,
  getSuggestedCurrency,
  type PaymentCurrency,
  type PublicBlogDetail,
} from "@/lib/api"

function BlogPaywall({ post, token }: { post: PublicBlogDetail; token?: string }) {
  const [currency, setCurrency] = useState<PaymentCurrency>("USD")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    getSuggestedCurrency()
      .then((res) => setCurrency(res.currency))
      .catch(() => {})
  }, [])

  const price = currency === "BDT" ? post.priceBdt : post.priceUsd
  const discountAmount = Math.round((price * post.discountPercent) / 100)
  const finalPrice = price - discountAmount
  const symbol = currency === "BDT" ? "৳" : "$"

  async function handleUnlock() {
    if (!token) return
    setBusy(true)
    setError("")
    setMessage("")
    try {
      const result = await createBlogCheckout(token, post.id, currency)
      if (result.live && result.checkoutUrl) {
        window.location.assign(result.checkoutUrl)
        return
      }
      setMessage(result.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-[34px_30px] text-center">
      <span className="text-section-label font-bold block mb-3" style={{ color: "var(--gold)" }}>
        Members-Only Content
      </span>
      <h3 className="font-heading text-[21px] text-navy mb-[10px]">This post requires a one-time purchase</h3>
      <p className="text-[13.5px] text-muted-foreground mb-5">
        Read the excerpt above for free — unlock the full post to continue reading.
      </p>

      <div className="inline-flex bg-background border border-border rounded-lg p-1 mb-5">
        {(["BDT", "USD"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${
              currency === c ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
            }`}
          >
            {c === "BDT" ? "৳ BDT" : "$ USD"}
          </button>
        ))}
      </div>

      <div className="mb-5">
        {post.discountPercent > 0 ? (
          <>
            <span className="text-[15px] text-muted-foreground line-through mr-2">
              {symbol}
              {price.toLocaleString()}
            </span>
            <span className="text-[26px] font-bold text-navy">
              {symbol}
              {finalPrice.toLocaleString()}
            </span>
            <span className="text-[12.5px] text-gold font-semibold block mt-1">
              {post.discountPercent}% member discount applied
            </span>
          </>
        ) : (
          <span className="text-[26px] font-bold text-navy">
            {symbol}
            {price.toLocaleString()}
          </span>
        )}
      </div>

      {message && (
        <p className="text-[13px] text-success-text bg-success-bg rounded-lg px-3.5 py-2.5 mb-4 max-w-[440px] mx-auto">
          {message}
        </p>
      )}
      {error && (
        <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4 max-w-[440px] mx-auto">
          {error}
        </p>
      )}

      {token ? (
        <Button disabled={busy} onClick={handleUnlock}>
          {busy ? "Processing…" : "Unlock This Post"}
        </Button>
      ) : (
        <p className="text-[13px] text-muted-foreground">
          <Link href="/login" className="text-gold font-semibold hover:underline">
            Sign in
          </Link>{" "}
          to unlock this post.
        </p>
      )}
    </div>
  )
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data: session } = useSession()
  const token = session?.accessToken

  const [post, setPost] = useState<PublicBlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const requestIdRef = useRef(0)

  // Guards against a slower anonymous request (fired before the session
  // token resolves) overwriting a newer authenticated response.
  useEffect(() => {
    const requestId = ++requestIdRef.current
    const timeout = setTimeout(() => {
      setLoading(true)
      setNotFound(false)
      getBlogBySlug(slug, token)
        .then((data) => {
          if (requestIdRef.current === requestId) setPost(data)
        })
        .catch((err) => {
          if (requestIdRef.current !== requestId) return
          if (err instanceof ApiError && err.status === 404) setNotFound(true)
        })
        .finally(() => {
          if (requestIdRef.current === requestId) setLoading(false)
        })
    }, 0)
    return () => clearTimeout(timeout)
  }, [slug, token])

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
          lockedContent={
            <>
              {post.excerpt && (
                <p className="text-[16px] leading-[1.75] text-foreground mb-8">{post.excerpt}</p>
              )}
              <BlogPaywall post={post} token={token} />
            </>
          }
        />
      </main>
      <Footer />
    </>
  )
}
