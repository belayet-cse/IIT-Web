"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ApiError, createForumReply, getForumThread, type ForumThreadDetail } from "@/lib/api"

function paragraphs(content: string) {
  return content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
}

export default function ForumThreadPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const { data: session, status } = useSession()
  const token = session?.accessToken

  const [thread, setThread] = useState<ForumThreadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [reply, setReply] = useState("")
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(() => {
    if (!token) return
    setLoading(true)
    setNotFound(false)
    getForumThread(token, id)
      .then(setThread)
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) setNotFound(true)
        else setError(err instanceof ApiError ? err.message : "Failed to load thread.")
      })
      .finally(() => setLoading(false))
  }, [token, id])

  useEffect(() => {
    const timeout = setTimeout(load, 0)
    return () => clearTimeout(timeout)
  }, [load])

  async function handleReply() {
    if (!token || !reply.trim()) return
    setPosting(true)
    setError("")
    try {
      await createForumReply(token, id, reply)
      setReply("")
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to post reply.")
    } finally {
      setPosting(false)
    }
  }

  if (status === "loading" || loading) {
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

  if (notFound || !thread) {
    return (
      <>
        <TopNav />
        <main className="pt-20 min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
          <h1 className="font-heading text-[26px] text-navy mb-2">Thread not found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This thread doesn&apos;t exist, or you don&apos;t have access to the forum.
          </p>
          <Link href="/forum" className="text-gold text-nav hover:underline">
            ← Back to forum
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
        <section className="py-14 bg-background">
          <div className="max-w-[720px] mx-auto px-6">
            <Link href="/forum" className="text-gold text-nav hover:underline text-[13px] mb-6 inline-block">
              ← Back to forum
            </Link>

            <div className="flex items-center gap-2 mb-2">
              {thread.pinned && <span className="text-[11px] font-semibold text-gold">📌 Pinned</span>}
              {thread.locked && <span className="text-[11px] font-semibold text-destructive">🔒 Locked</span>}
              {thread.category && <span className="text-[11px] text-muted-foreground">{thread.category}</span>}
            </div>
            <h1 className="font-heading text-[28px] text-navy mb-2">{thread.title}</h1>
            <p className="text-[13px] text-muted-foreground mb-6">
              {thread.author} · {new Date(thread.createdAt).toLocaleDateString()} · {thread.views} views
            </p>

            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              {paragraphs(thread.content).map((p, i) => (
                <p key={i} className="text-[15px] leading-[1.7] text-foreground mb-3 last:mb-0">
                  {p}
                </p>
              ))}
            </div>

            <h2 className="font-heading text-[18px] text-navy mb-4">
              {thread.replyCount} {thread.replyCount === 1 ? "Reply" : "Replies"}
            </h2>

            <div className="space-y-4 mb-8">
              {thread.replies.map((r) => (
                <div key={r.id} className="bg-card border border-border rounded-xl p-5">
                  <p className="text-[12.5px] font-semibold text-navy mb-2">
                    {r.author} <span className="font-normal text-muted-foreground">· {new Date(r.createdAt).toLocaleDateString()}</span>
                  </p>
                  {paragraphs(r.content).map((p, i) => (
                    <p key={i} className="text-[14px] leading-[1.7] text-foreground mb-2 last:mb-0">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            {error && (
              <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mb-4">{error}</p>
            )}

            {thread.locked ? (
              <p className="text-[13px] text-muted-foreground bg-muted rounded-lg px-3.5 py-2.5">
                This thread is locked — no new replies can be posted.
              </p>
            ) : (
              <div className="bg-card border border-border rounded-xl p-5">
                <Textarea
                  rows={3}
                  placeholder="Write a reply…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="mb-3"
                />
                <Button disabled={posting || !reply.trim()} onClick={handleReply}>
                  {posting ? "Posting…" : "Post Reply"}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
