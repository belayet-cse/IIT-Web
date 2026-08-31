"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/shared/hero"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  ApiError,
  createForumThread,
  getCategories,
  getForumThreads,
  type Category,
  type ForumThreadSummary,
} from "@/lib/api"

const PLACEHOLDER_THREADS = [
  {
    title: "How are you handling discrepant documents under UCP 600 in practice?",
    author: "Rafiq Ahmed",
    category: "Letter of Credit",
    replyCount: 14,
    views: 212,
  },
  {
    title: "Supply chain finance adoption — what's actually working in Bangladesh?",
    author: "Nafisa Islam",
    category: "Trade Digitalization",
    replyCount: 8,
    views: 96,
  },
  {
    title: "Best practices for TBML red-flag screening at branch level",
    author: "Karim Hasan",
    category: "Compliance",
    replyCount: 21,
    views: 340,
  },
]

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return "just now"
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function NewThreadForm({ token, onCreated }: { token: string; onCreated: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) getCategories().then(setCategories).catch(() => {})
  }, [open])

  async function handleSubmit() {
    setError("")
    setIsSaving(true)
    try {
      const result = await createForumThread(token, { title, content, category: category || undefined })
      onCreated(result.id)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create thread.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="whitespace-nowrap">
        + Start New Topic
      </Button>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-[26px] mb-6">
      <h3 className="font-heading text-[18px] text-navy mb-4">Start a new topic</h3>
      {error && <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>}
      <Input placeholder="Topic title" value={title} onChange={(e) => setTitle(e.target.value)} className="mb-3" />
      <Select value={category} onChange={(e) => setCategory(e.target.value)} className="mb-3">
        <option value="">No category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </Select>
      <Textarea
        rows={5}
        placeholder="Share context, a question, or a case you'd like input on…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mb-4"
      />
      <div className="flex gap-2">
        <Button disabled={isSaving || !title || !content} onClick={handleSubmit}>
          {isSaving ? "Posting…" : "Post Topic"}
        </Button>
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function ThreadRow({ thread }: { thread: ForumThreadSummary }) {
  return (
    <Link
      href={`/forum/${thread.id}`}
      className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-4 hover:border-gold/50 hover:shadow-sm transition-all"
    >
      <div className="w-[38px] h-[38px] rounded-full bg-navy text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0">
        {initials(thread.author)}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-[15px] text-navy truncate mb-1">
          {thread.pinned && <span className="text-gold text-[11px] font-bold uppercase mr-1.5">Pinned</span>}
          {thread.locked && <span className="text-destructive text-[11px] font-bold uppercase mr-1.5">Locked</span>}
          {thread.title}
        </h3>
        <p className="text-[11.5px] text-muted-foreground flex items-center gap-2 flex-wrap">
          {thread.category && (
            <span className="text-[10px] font-bold uppercase tracking-wide bg-muted text-navy rounded-full px-[9px] py-[3px]">
              {thread.category}
            </span>
          )}
          <span>
            Started by {thread.author} · {timeAgo(thread.createdAt)}
          </span>
        </p>
      </div>
      <div className="flex-shrink-0 flex gap-5 text-center">
        <div>
          <div className="text-[14px] font-bold text-navy font-sans">{thread.replyCount}</div>
          <div className="text-[10.5px] text-muted-foreground">Replies</div>
        </div>
        <div>
          <div className="text-[14px] font-bold text-navy font-sans">{thread.views}</div>
          <div className="text-[10.5px] text-muted-foreground">Views</div>
        </div>
      </div>
    </Link>
  )
}

const SORTS = ["Latest", "Most Replies", "Unanswered", "Pinned"] as const
type Sort = (typeof SORTS)[number]

export default function ForumPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = session?.user?.role
  const isQualified = role === "PREMIUM" || role === "ALUMNI" || role === "ADMIN"
  const token = session?.accessToken

  const [threads, setThreads] = useState<ForumThreadSummary[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [sort, setSort] = useState<Sort>("Latest")

  useEffect(() => {
    if (isQualified) getCategories().then(setCategories).catch(() => {})
  }, [isQualified])

  useEffect(() => {
    if (!isQualified || !token) return
    const timeout = setTimeout(() => {
      setLoading(true)
      getForumThreads(token, { search: search || undefined, category: category || undefined, limit: 50 })
        .then((res) => {
          setThreads(res.data)
          setTotal(res.meta.total)
        })
        .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load threads."))
        .finally(() => setLoading(false))
    }, 250)
    return () => clearTimeout(timeout)
  }, [isQualified, token, search, category])

  const visibleThreads = useMemo(() => {
    const list = [...threads]
    if (sort === "Most Replies") list.sort((a, b) => b.replyCount - a.replyCount)
    else if (sort === "Unanswered") return list.filter((t) => t.replyCount === 0)
    else if (sort === "Pinned") return list.filter((t) => t.pinned)
    return list
  }, [threads, sort])

  if (status === "loading") {
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

  if (!isQualified) {
    return (
      <>
        <TopNav />
        <main className="pt-20">
          <Hero
            eyebrow="Discussion Forum"
            title="Discussion Forum"
            subtitle="Where trade finance professionals discuss real cases, share insight, and learn from each other."
          />
          <section className="py-[70px]">
            <div className="max-w-[900px] mx-auto px-6">
              <div className="max-w-[640px] mx-auto text-center border border-border rounded-2xl p-10 mb-11">
                <div className="w-14 h-14 rounded-full bg-navy text-gold flex items-center justify-center text-[22px] mx-auto mb-5">
                  🔒
                </div>
                <h2 className="font-heading text-[24px] text-navy mb-2.5">Members-Only Forum</h2>
                <p className="text-[14px] text-muted-foreground max-w-[440px] mx-auto mb-[26px]">
                  The Discussion Forum is available to Premium members and verified Alumni. Free/General accounts
                  can browse Q&amp;A, but discussion access requires an upgrade.
                </p>
                <div className="flex gap-2.5 justify-center flex-wrap mb-7">
                  <span className="text-[11.5px] font-bold uppercase tracking-wide px-3.5 py-1.5 rounded-full bg-gold/15 text-gold">
                    Premium Access
                  </span>
                  <span className="text-[11.5px] font-bold uppercase tracking-wide px-3.5 py-1.5 rounded-full bg-gold/15 text-gold">
                    Alumni Access
                  </span>
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link
                    href="/membership"
                    className="inline-block bg-gold text-navy text-[13px] font-semibold px-5 py-[11px] rounded-md hover:opacity-90 transition-opacity"
                  >
                    Upgrade to Premium
                  </Link>
                  <Link
                    href="/alumni/apply"
                    className="inline-block border border-navy text-navy text-[13px] font-semibold px-5 py-[11px] rounded-md hover:bg-navy hover:text-white transition-colors"
                  >
                    Alumni Access
                  </Link>
                </div>
              </div>

              <div className="relative max-w-[760px] mx-auto mt-11">
                <div className="space-y-2.5" style={{ filter: "blur(3.5px)", opacity: 0.5, pointerEvents: "none", userSelect: "none" }}>
                  {PLACEHOLDER_THREADS.map((t) => (
                    <div key={t.title} className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-4">
                      <div className="w-[38px] h-[38px] rounded-full bg-navy text-white flex items-center justify-center text-[13px] font-bold flex-shrink-0">
                        {initials(t.author)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-[15px] text-navy truncate mb-1">{t.title}</h3>
                        <p className="text-[11.5px] text-muted-foreground flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wide bg-muted text-navy rounded-full px-[9px] py-[3px]">
                            {t.category}
                          </span>
                          <span>Started by {t.author}</span>
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex gap-5 text-center">
                        <div>
                          <div className="text-[14px] font-bold text-navy font-sans">{t.replyCount}</div>
                          <div className="text-[10.5px] text-muted-foreground">Replies</div>
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-navy font-sans">{t.views}</div>
                          <div className="text-[10.5px] text-muted-foreground">Views</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,.6) 40%)" }}
                />
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <TopNav />
      <main className="pt-20">
        <Hero
          eyebrow="Discussion Forum"
          title="Discussion Forum"
          subtitle="Connect with fellow Premium members and alumni across the trade finance community."
        />
        <section className="py-16 bg-card">
          <div className="max-w-[1080px] mx-auto px-6">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
              <div>
                <h2 className="font-heading text-[22px] text-navy">Discussion Forum</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">{total} topics</p>
              </div>
              {token && <NewThreadForm token={token} onCreated={(id) => router.push(`/forum/${id}`)} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
              <aside className="md:border-r border-border md:pr-5">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-bold mb-2.5">
                  Categories
                </div>
                <button
                  onClick={() => setCategory(null)}
                  className={`block w-full text-left text-[13.5px] px-2.5 py-2 rounded-md mb-0.5 transition-colors ${
                    category === null ? "bg-muted text-navy font-bold" : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  All Topics
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.name)}
                    className={`block w-full text-left text-[13.5px] px-2.5 py-2 rounded-md mb-0.5 transition-colors ${
                      category === c.name ? "bg-muted text-navy font-bold" : "text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </aside>

              <div>
                <Input
                  placeholder="Search topics…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-4"
                />
                <div className="flex gap-1 mb-5">
                  {SORTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={`text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                        sort === s ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {error && (
                  <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>
                )}

                {loading ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Loading…</p>
                ) : visibleThreads.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    {search || category ? "No topics match your filters." : "No topics yet — be the first to start a discussion."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {visibleThreads.map((t) => (
                      <ThreadRow key={t.id} thread={t} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
