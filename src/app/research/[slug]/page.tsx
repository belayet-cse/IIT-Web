"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Eyebrow } from "@/components/shared/eyebrow"
import { Button } from "@/components/ui/button"
import {
  ApiError,
  createResearchCheckout,
  getResearchPaperBySlug,
  getSuggestedCurrency,
  type PaymentCurrency,
  type PublicResearchPaperDetail,
} from "@/lib/api"

function ResearchPaywall({ paper, token }: { paper: PublicResearchPaperDetail; token?: string }) {
  const [currency, setCurrency] = useState<PaymentCurrency>("USD")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    getSuggestedCurrency()
      .then((res) => setCurrency(res.currency))
      .catch(() => {})
  }, [])

  const price = currency === "BDT" ? paper.priceBdt : paper.priceUsd
  const discountAmount = Math.round((price * paper.discountPercent) / 100)
  const finalPrice = price - discountAmount
  const symbol = currency === "BDT" ? "৳" : "$"

  async function handleUnlock() {
    if (!token) return
    setBusy(true)
    setError("")
    setMessage("")
    try {
      const result = await createResearchCheckout(token, paper.id, currency)
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
      <h3 className="font-heading text-[21px] text-navy mb-[10px]">This paper requires a one-time purchase</h3>
      <p className="text-[13.5px] text-muted-foreground mb-5">
        Read the abstract above for free — unlock the full paper to continue reading.
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
        {paper.discountPercent > 0 ? (
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
              {paper.discountPercent}% member discount applied
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
          {busy ? "Processing…" : "Unlock Full Paper"}
        </Button>
      ) : (
        <p className="text-[13px] text-muted-foreground">
          <Link href="/login" className="text-gold font-semibold hover:underline">
            Sign in
          </Link>{" "}
          to unlock this paper.
        </p>
      )}
    </div>
  )
}

export default function ResearchPaperPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data: session } = useSession()
  const token = session?.accessToken

  const [paper, setPaper] = useState<PublicResearchPaperDetail | null>(null)
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
      getResearchPaperBySlug(slug, token)
        .then((data) => {
          if (requestIdRef.current === requestId) setPaper(data)
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

  if (notFound || !paper) {
    return (
      <>
        <TopNav />
        <main className="pt-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
          <h1 className="font-heading text-[26px] text-navy mb-2">Paper not found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This research paper doesn&apos;t exist or is no longer published.
          </p>
          <Link href="/research" className="text-gold text-nav hover:underline">
            ← Back to all papers
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
        <section
          className="relative overflow-hidden text-white text-center py-[64px] pb-[44px]"
          style={{
            background:
              "linear-gradient(160deg, rgba(10,18,41,.94), rgba(10,18,41,.86)), radial-gradient(circle at 80% 20%, rgba(201,168,76,.18), transparent 55%)",
          }}
        >
          <div className="relative z-10 max-w-[760px] mx-auto px-6">
            {paper.category && <Eyebrow variant="light">{paper.category}</Eyebrow>}
            <h1 className="font-heading text-[34px] font-bold text-white mb-4 leading-tight">{paper.title}</h1>
            <div className="flex items-center justify-center gap-2 text-[13px]" style={{ color: "#c7cbe0" }}>
              <span>{paper.author}</span>
              <span aria-hidden>·</span>
              <span>{paper.readingTime} min read</span>
              {paper.publishedAt && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {new Date(paper.publishedAt).toLocaleDateString("en-US", {
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

        {paper.featuredImage && (
          <div className="max-w-[820px] mx-auto px-6 -mt-8 relative z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={paper.featuredImage}
              alt=""
              className="w-full max-h-[420px] object-cover rounded-xl border border-border shadow-lg"
            />
          </div>
        )}

        <article className="py-16">
          <div className="max-w-[720px] mx-auto px-6">
            <div className="bg-muted/50 border border-border rounded-xl p-6 mb-8">
              <h2 className="text-section-label text-muted-foreground font-bold mb-2">Abstract</h2>
              <p className="text-[15px] leading-[1.75] text-foreground">{paper.abstract}</p>
            </div>

            {paper.locked ? (
              <ResearchPaywall paper={paper} token={token} />
            ) : (
              <div
                className="rich-content text-[16px] text-foreground"
                dangerouslySetInnerHTML={{ __html: paper.content ?? "" }}
              />
            )}

            <div className="mt-12 pt-8 border-t border-border">
              <Link href="/research" className="text-gold text-nav hover:underline">
                ← Back to all papers
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
