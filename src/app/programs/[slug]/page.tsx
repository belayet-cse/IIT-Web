"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Eyebrow } from "@/components/shared/eyebrow"
import { Button } from "@/components/ui/button"
import {
  ApiError,
  completeProgramModule,
  createProgramCheckout,
  downloadCertificate,
  enrollInProgram,
  getProgramBySlug,
  getSuggestedCurrency,
  type PaymentCurrency,
  type PublicProgramDetail,
} from "@/lib/api"

function EnrollAction({
  program,
  token,
  onEnrolled,
}: {
  program: PublicProgramDetail
  token?: string
  onEnrolled: () => void
}) {
  const [currency, setCurrency] = useState<PaymentCurrency>("USD")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    getSuggestedCurrency()
      .then((res) => setCurrency(res.currency))
      .catch(() => {})
  }, [])

  const isFree = program.finalPriceBdt === 0 && program.finalPriceUsd === 0

  async function handleFreeEnroll() {
    if (!token) return
    setBusy(true)
    setError("")
    try {
      await enrollInProgram(token, program.id)
      onEnrolled()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to enroll. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  async function handlePaidEnroll() {
    if (!token) return
    setBusy(true)
    setError("")
    setMessage("")
    try {
      const result = await createProgramCheckout(token, program.id, currency)
      setMessage(result.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <div className="bg-card border border-border rounded-xl p-[34px_30px] text-center">
        <h3 className="font-heading text-[21px] text-navy mb-[10px]">Sign in to enroll</h3>
        <p className="text-[13px] text-muted-foreground">
          <Link href="/login" className="text-gold font-semibold hover:underline">
            Sign in
          </Link>{" "}
          or{" "}
          <Link href="/register" className="text-gold font-semibold hover:underline">
            create an account
          </Link>{" "}
          to enroll in this program.
        </p>
      </div>
    )
  }

  if (isFree) {
    return (
      <div className="bg-card border border-border rounded-xl p-[34px_30px] text-center">
        <h3 className="font-heading text-[21px] text-navy mb-[10px]">
          {program.discountPercent === 100 ? "Free for your membership" : "This program is free"}
        </h3>
        {error && (
          <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4 max-w-[440px] mx-auto">
            {error}
          </p>
        )}
        <Button disabled={busy} onClick={handleFreeEnroll}>
          {busy ? "Enrolling…" : "Enroll Now"}
        </Button>
      </div>
    )
  }

  const price = currency === "BDT" ? program.priceBdt : program.priceUsd
  const finalPrice = currency === "BDT" ? program.finalPriceBdt : program.finalPriceUsd
  const symbol = currency === "BDT" ? "৳" : "$"

  return (
    <div className="bg-card border border-border rounded-xl p-[34px_30px] text-center">
      <h3 className="font-heading text-[21px] text-navy mb-[10px]">Enroll in this program</h3>

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
        {program.discountPercent > 0 ? (
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
              {program.discountPercent}% member discount applied
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

      <Button disabled={busy} onClick={handlePaidEnroll}>
        {busy ? "Processing…" : "Enroll & Pay"}
      </Button>
    </div>
  )
}

function CertificateAction({ program, token }: { program: PublicProgramDetail; token: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function handleDownload() {
    setBusy(true)
    setError("")
    try {
      await downloadCertificate(token, program.id, `${program.slug}-certificate.pdf`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to download certificate. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-success-bg border border-border rounded-xl p-6 text-center mb-6">
      <p className="text-[14px] text-success-text font-semibold mb-3">
        ✓ You&apos;ve completed all modules in this program.
      </p>
      {error && <p className="text-[13px] text-destructive mb-3">{error}</p>}
      <Button disabled={busy} onClick={handleDownload}>
        {busy ? "Preparing…" : "Download Certificate"}
      </Button>
    </div>
  )
}

export default function ProgramDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const { data: session } = useSession()
  const token = session?.accessToken

  const [program, setProgram] = useState<PublicProgramDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [completeError, setCompleteError] = useState("")
  const requestIdRef = useRef(0)

  // The effect below re-fires as the session token resolves from undefined
  // to its real value (and again under StrictMode's double-invoke in dev) —
  // this guard discards any response that isn't from the most recent call,
  // so a slower anonymous request can't overwrite a newer authenticated one.
  const load = useCallback(() => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setNotFound(false)
    getProgramBySlug(slug, token)
      .then((data) => {
        if (requestIdRef.current === requestId) setProgram(data)
      })
      .catch((err) => {
        if (requestIdRef.current !== requestId) return
        if (err instanceof ApiError && err.status === 404) setNotFound(true)
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setLoading(false)
      })
  }, [slug, token])

  useEffect(() => {
    const timeout = setTimeout(load, 0)
    return () => clearTimeout(timeout)
  }, [load])

  async function handleMarkComplete(moduleId: string) {
    if (!token || !program) return
    setCompletingId(moduleId)
    setCompleteError("")
    try {
      await completeProgramModule(token, program.id, moduleId)
      load()
    } catch (err) {
      setCompleteError(err instanceof ApiError ? err.message : "Failed to mark module complete. Please try again.")
    } finally {
      setCompletingId(null)
    }
  }

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

  if (notFound || !program) {
    return (
      <>
        <TopNav />
        <main className="pt-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
          <h1 className="font-heading text-[26px] text-navy mb-2">Program not found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This certification program doesn&apos;t exist or is no longer published.
          </p>
          <Link href="/programs" className="text-gold text-nav hover:underline">
            ← Back to all programs
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
            <Eyebrow variant="light">{program.type === "INTERNATIONAL" ? "International" : "Proprietary"}</Eyebrow>
            <h1 className="font-heading text-[34px] font-bold text-white mb-4 leading-tight">
              {program.code ? `${program.code} — ${program.title}` : program.title}
            </h1>
            <p className="text-[13px]" style={{ color: "#c7cbe0" }}>
              {program.author}
            </p>
          </div>
        </section>

        {program.featuredImage && (
          <div className="max-w-[820px] mx-auto px-6 -mt-8 relative z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={program.featuredImage}
              alt=""
              className="w-full max-h-[420px] object-cover rounded-xl border border-border shadow-lg"
            />
          </div>
        )}

        <article className="py-16">
          <div className="max-w-[720px] mx-auto px-6">
            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <h2 className="text-section-label text-muted-foreground font-bold mb-2">Overview</h2>
              <p className="text-[15px] leading-[1.75] text-foreground">{program.overview}</p>
            </div>

            {program.whoItsFor && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h2 className="text-section-label text-muted-foreground font-bold mb-2">Who It&apos;s For</h2>
                <p className="text-[15px] leading-[1.75] text-foreground">{program.whoItsFor}</p>
              </div>
            )}

            {program.examInfo && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h2 className="text-section-label text-muted-foreground font-bold mb-2">Exam Info</h2>
                <p className="text-[15px] leading-[1.75] text-foreground">{program.examInfo}</p>
              </div>
            )}

            {program.modules.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-section-label text-muted-foreground font-bold">Curriculum</h2>
                  {program.enrolled && (
                    <span className="text-[12.5px] font-semibold text-muted-foreground">
                      {program.completedModuleIds.length} of {program.modules.length} modules complete
                    </span>
                  )}
                </div>
                {completeError && <p className="text-[13px] text-destructive mb-3">{completeError}</p>}
                <ul className="space-y-2.5">
                  {program.modules.map((m, i) => {
                    const isComplete = program.completedModuleIds.includes(m.id)
                    return (
                      <li key={m.id} className="flex items-center gap-3 text-[14px] text-foreground">
                        <span
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                            isComplete ? "bg-success-bg text-success-text" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isComplete ? "✓" : i + 1}
                        </span>
                        {m.videoUrl ? (
                          <a href={m.videoUrl} target="_blank" rel="noreferrer" className="text-gold hover:underline">
                            {m.title}
                          </a>
                        ) : (
                          <span>{m.title}</span>
                        )}
                        {program.enrolled && !isComplete && (
                          <button
                            onClick={() => handleMarkComplete(m.id)}
                            disabled={completingId === m.id}
                            className="ml-auto text-[12.5px] font-semibold text-gold hover:underline disabled:opacity-60"
                          >
                            {completingId === m.id ? "Marking…" : "Mark Complete"}
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {program.enrolled ? (
              program.completedAt && token ? (
                <CertificateAction program={program} token={token} />
              ) : (
                <div className="bg-success-bg border border-border rounded-xl p-6 text-center">
                  <p className="text-[14px] text-success-text font-semibold">
                    ✓ You&apos;re enrolled in this program — curriculum links above are unlocked.
                  </p>
                </div>
              )
            ) : (
              <EnrollAction program={program} token={token} onEnrolled={load} />
            )}

            <div className="mt-12 pt-8 border-t border-border">
              <Link href="/programs" className="text-gold text-nav hover:underline">
                ← Back to all programs
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
