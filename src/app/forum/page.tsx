"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/shared/hero"
import { LockedOverlay } from "@/components/shared/locked-overlay"
import { GateCard } from "@/components/cards/gate-card"
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
  { title: "Best practices for confirming LCs in volatile markets", author: "Member", replies: 12 },
  { title: "Anyone attending the Dhaka trade summit next month?", author: "Member", replies: 4 },
  { title: "CDCS exam prep — study group forming", author: "Member", replies: 21 },
]

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
      <Button onClick={() => setOpen(true)} className="mb-6">
        + New Thread
      </Button>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-[26px] mb-6">
      <h3 className="font-heading text-[18px] text-navy mb-4">Start a new thread</h3>
      {error && <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>}
      <Input placeholder="Thread title" value={title} onChange={(e) => setTitle(e.target.value)} className="mb-3" />
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
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mb-4"
      />
      <div className="flex gap-2">
        <Button disabled={isSaving || !title || !content} onClick={handleSubmit}>
          {isSaving ? "Posting…" : "Post Thread"}
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
      className="flex items-center justify-between gap-4 bg-card border border-border rounded-xl px-5 py-4 hover:border-gold/50 transition-colors"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {thread.pinned && <span className="text-[11px] font-semibold text-gold">📌 Pinned</span>}
          {thread.locked && <span className="text-[11px] font-semibold text-destructive">🔒 Locked</span>}
          {thread.category && <span className="text-[11px] text-muted-foreground">{thread.category}</span>}
        </div>
        <h3 className="font-heading text-[16px] text-navy truncate">{thread.title}</h3>
        <p className="text-[12px] text-muted-foreground mt-1">
          {thread.author} · {new Date(thread.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex-shrink-0 text-center">
        <div className="text-[18px] font-bold text-navy">{thread.replyCount}</div>
        <div className="text-[11px] text-muted-foreground">replies</div>
      </div>
    </Link>
  )
}

export default function ForumPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const role = session?.user?.role
  const isQualified = role === "PREMIUM" || role === "ALUMNI" || role === "ADMIN"
  const token = session?.accessToken

  const [threads, setThreads] = useState<ForumThreadSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isQualified || !token) return
    const timeout = setTimeout(() => {
      setLoading(true)
      getForumThreads(token)
        .then((res) => setThreads(res.data))
        .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load threads."))
        .finally(() => setLoading(false))
    }, 0)
    return () => clearTimeout(timeout)
  }, [isQualified, token])

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
            subtitle="A private space for Premium members and alumni to connect, ask questions, and share insight."
          />
          <section className="py-16 bg-card">
            <div className="max-w-[840px] mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
                <GateCard
                  variant="primary"
                  tag="Premium members"
                  title="Upgrade to Premium"
                  description="Choose a plan to unlock the forum, member discounts, and more."
                  buttonLabel="View Plans"
                  buttonHref="/membership"
                />
                <GateCard
                  variant="outline"
                  tag="IITrade alumni"
                  title="Apply for Alumni Membership"
                  description="Verified alumni get full forum access at no cost."
                  buttonLabel="Apply Now"
                  buttonHref="/alumni/apply"
                />
              </div>

              <LockedOverlay
                title="Forum locked"
                description="Sign in as a Premium member or verified alumni to view and join discussions."
              >
                <div className="space-y-3">
                  {PLACEHOLDER_THREADS.map((t) => (
                    <div key={t.title} className="bg-card border border-border rounded-xl px-5 py-4">
                      <h3 className="font-heading text-[16px] text-navy">{t.title}</h3>
                      <p className="text-[12px] text-muted-foreground mt-1">
                        {t.author} · {t.replies} replies
                      </p>
                    </div>
                  ))}
                </div>
              </LockedOverlay>
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
          <div className="max-w-[840px] mx-auto px-6">
            {token && <NewThreadForm token={token} onCreated={(id) => router.push(`/forum/${id}`)} />}

            {error && (
              <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>
            )}

            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-10">Loading…</p>
            ) : threads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No threads yet — be the first to start a discussion.
              </p>
            ) : (
              <div className="space-y-3">
                {threads.map((t) => (
                  <ThreadRow key={t.id} thread={t} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
