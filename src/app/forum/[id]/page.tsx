"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  ApiError,
  createForumReply,
  getForumThread,
  toggleForumPostLike,
  toggleForumThreadLike,
  type ForumReply,
  type ForumRole,
  type ForumThreadDetail,
} from "@/lib/api"

// A "quoted" reply stores its reference as a leading "> author: text" line in
// the plain-text content field — no separate DB column needed for this.
const QUOTE_PREFIX = "> "

function splitQuote(content: string) {
  if (!content.startsWith(QUOTE_PREFIX)) return { quote: null, body: content }
  const [firstLine, ...rest] = content.split("\n")
  return { quote: firstLine.slice(QUOTE_PREFIX.length), body: rest.join("\n").trim() }
}

function paragraphs(content: string) {
  return content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
}

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
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const ROLE_BADGE: Partial<Record<ForumRole, { label: string; bg: string; text: string }>> = {
  ALUMNI: { label: "Alumni", bg: "#eef0fb", text: "#3d4ba0" },
  PREMIUM: { label: "Premium", bg: "#e7f6ec", text: "#1a7a3f" },
  ADMIN: { label: "Admin", bg: "#fdf3d8", text: "#946c00" },
}

const ROLE_LABEL: Partial<Record<ForumRole, string>> = {
  ALUMNI: "Alumni",
  PREMIUM: "Premium Member",
  ADMIN: "Admin",
}

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span
      className="text-[9.5px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  )
}

interface PostCardProps {
  postId: string
  authorName: string
  authorRole: ForumRole
  authorOrganization: string | null
  isTopicStarter: boolean
  createdAt: string
  content: string
  likeCount: number
  isLiked: boolean
  isOp?: boolean
  nested?: boolean
  onLike: (postId: string) => void
  onReply: (postId: string, authorName: string) => void
  onQuote: (postId: string, authorName: string, content: string) => void
  onShare?: () => void
}

function PostCard({
  postId,
  authorName,
  authorRole,
  authorOrganization,
  isTopicStarter,
  createdAt,
  content,
  likeCount,
  isLiked,
  isOp,
  nested,
  onLike,
  onReply,
  onQuote,
  onShare,
}: PostCardProps) {
  const roleBadge = ROLE_BADGE[authorRole]
  const { quote, body } = splitQuote(content)

  return (
    <div
      className={`bg-card border rounded-xl p-5 flex gap-4 ${isOp ? "border-gold" : "border-border"} ${
        nested ? "ml-8 md:ml-[52px]" : ""
      }`}
      style={isOp ? { boxShadow: "0 0 0 1px rgba(201,168,76,.25)" } : undefined}
    >
      <div
        className={`rounded-full bg-navy text-white flex items-center justify-center font-bold flex-shrink-0 ${
          nested ? "w-8 h-8 text-[12px]" : "w-10 h-10 text-[13px]"
        }`}
      >
        {initials(authorName)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-[13.5px] font-bold text-navy">{authorName}</span>
          {isTopicStarter && <Badge label="Topic Starter" bg="#fdf3d8" text="#946c00" />}
          {!isTopicStarter && roleBadge && <Badge {...roleBadge} />}
        </div>
        {authorOrganization && (
          <p className="text-[12px] text-muted-foreground mb-0.5">{authorOrganization}</p>
        )}
        <p className="text-[11.5px] text-muted-foreground/80 mb-3">{timeAgo(createdAt)}</p>

        {quote && (
          <div className="bg-muted border-l-[3px] border-gold rounded px-3.5 py-2.5 mb-3 text-[12.5px] text-muted-foreground">
            {quote}
          </div>
        )}

        <div className="text-[14px] text-foreground leading-[1.8]">
          {paragraphs(body).map((p, i) => (
            <p key={i} className="mb-2.5 last:mb-0">
              {p}
            </p>
          ))}
        </div>

        <div className="flex items-center gap-5 mt-3.5 pt-3.5 border-t border-border/70">
          <button
            onClick={() => onLike(postId)}
            className={`text-[12px] flex items-center gap-1.5 transition-colors ${
              isLiked ? "text-gold font-semibold" : "text-muted-foreground hover:text-navy"
            }`}
          >
            👍 Like{likeCount > 0 ? ` · ${likeCount}` : ""}
          </button>
          <button
            onClick={() => onReply(postId, authorName)}
            className="text-[12px] text-muted-foreground hover:text-navy transition-colors"
          >
            💬 Reply
          </button>
          <button
            onClick={() => onQuote(postId, authorName, body)}
            className="text-[12px] text-muted-foreground hover:text-navy transition-colors"
          >
            🔖 Quote
          </button>
          {onShare && (
            <button
              onClick={onShare}
              className="text-[12px] text-muted-foreground hover:text-navy transition-colors"
            >
              🔁 Share
            </button>
          )}
        </div>
      </div>
    </div>
  )
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
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string; isOp: boolean } | null>(null)
  const [shareMessage, setShareMessage] = useState("")

  const requestIdRef = useRef(0)
  const composerRef = useRef<HTMLTextAreaElement>(null)

  const load = useCallback(() => {
    if (!token) return
    const requestId = ++requestIdRef.current
    setLoading(true)
    setNotFound(false)
    getForumThread(token, id)
      .then((data) => {
        if (requestIdRef.current === requestId) setThread(data)
      })
      .catch((err) => {
        if (requestIdRef.current !== requestId) return
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) setNotFound(true)
        else setError(err instanceof ApiError ? err.message : "Failed to load thread.")
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setLoading(false)
      })
  }, [token, id])

  useEffect(() => {
    const timeout = setTimeout(load, 0)
    return () => clearTimeout(timeout)
  }, [load])

  function focusComposer() {
    requestAnimationFrame(() => composerRef.current?.focus())
  }

  function handleReplyClick(postId: string, author: string) {
    setReplyingTo({ id: postId, author, isOp: postId === thread?.id })
    focusComposer()
  }

  function handleQuoteClick(postId: string, author: string, content: string) {
    const excerpt = content.length > 140 ? content.slice(0, 140).trim() + "…" : content
    setReplyingTo({ id: postId, author, isOp: postId === thread?.id })
    setReply(`${QUOTE_PREFIX}${author}: "${excerpt}"\n\n`)
    focusComposer()
  }

  async function handleThreadShare() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: thread?.title, url })
      } catch {
        // user cancelled — nothing to do
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareMessage("Link copied!")
      setTimeout(() => setShareMessage(""), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  async function handleLike(postId: string) {
    if (!token || !thread) return
    const prevThread = thread

    if (postId === thread.id) {
      // Liking the original post — lives on the thread itself, not a ForumPost.
      setThread({ ...thread, isLiked: !thread.isLiked, likeCount: thread.likeCount + (thread.isLiked ? -1 : 1) })
      try {
        await toggleForumThreadLike(token, postId)
      } catch {
        setThread(prevThread)
      }
      return
    }

    setThread({
      ...thread,
      replies: thread.replies.map((r) =>
        r.id === postId ? { ...r, isLiked: !r.isLiked, likeCount: r.likeCount + (r.isLiked ? -1 : 1) } : r
      ),
    })
    try {
      await toggleForumPostLike(token, postId)
    } catch {
      setThread(prevThread)
    }
  }

  async function handleReply() {
    if (!token || !reply.trim()) return
    setPosting(true)
    setError("")
    try {
      const parentPostId = replyingTo && !replyingTo.isOp ? replyingTo.id : undefined
      await createForumReply(token, id, reply, parentPostId)
      setReply("")
      setReplyingTo(null)
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

  const participantIds = new Set([thread.authorId, ...thread.replies.map((r) => r.authorId)])
  const topLevelReplies = thread.replies.filter((r) => !r.parentPostId)
  const childrenOf = (postId: string) => thread.replies.filter((r) => r.parentPostId === postId)

  function renderReply(r: ForumReply, nested: boolean) {
    return (
      <div key={r.id} className="space-y-3.5">
        <PostCard
          postId={r.id}
          authorName={r.author}
          authorRole={r.authorRole}
          authorOrganization={r.authorOrganization}
          isTopicStarter={r.authorId === thread!.authorId}
          createdAt={r.createdAt}
          content={r.content}
          likeCount={r.likeCount}
          isLiked={r.isLiked}
          nested={nested}
          onLike={handleLike}
          onReply={handleReplyClick}
          onQuote={handleQuoteClick}
        />
        {childrenOf(r.id).map((child) => renderReply(child, true))}
      </div>
    )
  }

  return (
    <>
      <TopNav />
      <main className="pt-20">
        <div className="bg-navy py-3">
          <div className="max-w-[820px] mx-auto px-6 flex items-center gap-2 text-[12.5px]">
            <Link href="/forum" className="text-[#c7cbe0] hover:text-gold transition-colors">
              Discussion Forum
            </Link>
            {thread.category && (
              <>
                <span className="text-[#565f85]">/</span>
                <span className="text-[#c7cbe0]">{thread.category}</span>
              </>
            )}
          </div>
        </div>

        <section className="pt-8 pb-6 bg-card border-b border-border">
          <div className="max-w-[820px] mx-auto px-6">
            {thread.category && (
              <span className="inline-block text-[10.5px] font-bold uppercase tracking-wide bg-muted text-navy rounded-full px-[11px] py-1 mb-3.5">
                {thread.category}
              </span>
            )}
            <h1 className="font-heading text-[26px] text-navy leading-[1.3] mb-3.5">{thread.title}</h1>
            <div className="flex gap-5 flex-wrap text-[12.5px] text-muted-foreground mb-4">
              <span>
                Started by <b className="text-navy">{thread.author}</b>
              </span>
              <span>{timeAgo(thread.createdAt)}</span>
              <span>
                <b className="text-navy">{thread.replyCount}</b> {thread.replyCount === 1 ? "reply" : "replies"}
              </span>
              <span>
                <b className="text-navy">{thread.views}</b> views
              </span>
            </div>
            <div className="flex gap-7 pt-1">
              <div>
                <div className="text-[15px] font-bold text-navy font-sans">{participantIds.size}</div>
                <div className="text-[12px] text-muted-foreground">Participants</div>
              </div>
              <div>
                <div className="text-[15px] font-bold text-navy font-sans">
                  {thread.replies.length ? timeAgo(thread.replies[thread.replies.length - 1].createdAt) : "—"}
                </div>
                <div className="text-[12px] text-muted-foreground">Last reply</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 pb-16">
          <div className="max-w-[820px] mx-auto px-6">
            <PostCard
              postId={thread.id}
              authorName={thread.author}
              authorRole={thread.authorRole}
              authorOrganization={thread.authorOrganization}
              isTopicStarter
              createdAt={thread.createdAt}
              content={thread.content}
              likeCount={thread.likeCount}
              isLiked={thread.isLiked}
              isOp
              onLike={handleLike}
              onReply={handleReplyClick}
              onQuote={handleQuoteClick}
              onShare={handleThreadShare}
            />
            {shareMessage && <p className="text-[12px] text-gold mt-1.5">{shareMessage}</p>}

            {topLevelReplies.length > 0 && (
              <div className="flex items-center gap-3 my-6 text-[11.5px] uppercase tracking-wide text-muted-foreground font-bold">
                {thread.replies.length} {thread.replies.length === 1 ? "Reply" : "Replies"}
                <span className="flex-1 h-px bg-border" />
              </div>
            )}

            <div className="space-y-3.5">{topLevelReplies.map((r) => renderReply(r, false))}</div>

            {error && (
              <p className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3.5 py-2.5 mt-4">{error}</p>
            )}

            {thread.locked ? (
              <p className="text-[13px] text-muted-foreground bg-muted rounded-lg px-3.5 py-2.5 mt-6">
                This thread is locked — no new replies can be posted.
              </p>
            ) : (
              <div className="bg-card border border-border rounded-xl p-5 mt-6 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gold text-navy flex items-center justify-center text-[13px] font-bold flex-shrink-0">
                  {session?.user?.name ? initials(session.user.name) : "?"}
                </div>
                <div className="flex-1">
                  {replyingTo && (
                    <div className="flex items-center justify-between text-[11.5px] text-muted-foreground bg-muted rounded-md px-3 py-1.5 mb-2">
                      <span>
                        Replying to <b className="text-navy">{replyingTo.author}</b>
                      </span>
                      <button
                        onClick={() => {
                          setReplyingTo(null)
                          setReply("")
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <Textarea
                    ref={composerRef}
                    rows={3}
                    placeholder="Add to the discussion…"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] text-muted-foreground">
                      Posting as {session?.user?.name ?? "you"}
                      {session?.user?.role && ROLE_LABEL[session.user.role as ForumRole] && (
                        <> · {ROLE_LABEL[session.user.role as ForumRole]}</>
                      )}
                    </span>
                    <Button disabled={posting || !reply.trim()} onClick={handleReply}>
                      {posting ? "Posting…" : "Post Reply"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
