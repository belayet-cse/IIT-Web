"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { NoticeTicker, type Notice } from "@/components/shared/notice-ticker"
import {
  getEvents,
  getForumStats,
  getForumThreads,
  getNotices,
  type EventSummary,
  type ForumStats,
  type ForumThreadSummary,
  type SiteNotice,
} from "@/lib/api"

const MIN_NOTICES = 4

/**
 * Site-wide notice ticker: admin-authored notices first, then live event and
 * forum activity, topped up with standing calls-to-action so it's never
 * empty. Drop this into any page — it fetches and composes its own data.
 */
export function SiteNoticeTicker() {
  const { data: session } = useSession()
  const isAlumni = session?.user?.role === "ALUMNI" || session?.user?.role === "ADMIN"
  const canUseForum = ["PREMIUM", "ALUMNI", "ADMIN"].includes(session?.user?.role ?? "")

  const [siteNotices, setSiteNotices] = useState<SiteNotice[]>([])
  const [forumStats, setForumStats] = useState<ForumStats | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<EventSummary[]>([])
  const [latestThreads, setLatestThreads] = useState<ForumThreadSummary[]>([])

  useEffect(() => {
    getNotices().then(setSiteNotices).catch(() => {})
    getForumStats().then(setForumStats).catch(() => {})
    getEvents({ when: "upcoming", limit: 4 })
      .then((res) => setUpcomingEvents(res.data))
      .catch(() => {})
  }, [])

  // Thread titles are members-only, so only forum-eligible users see them in the ticker.
  useEffect(() => {
    if (!canUseForum || !session?.accessToken) return
    getForumThreads(session.accessToken, { limit: 3 })
      .then((res) => setLatestThreads(res.data))
      .catch(() => {})
  }, [canUseForum, session?.accessToken])

  const notices = useMemo<Notice[]>(() => {
    const items: Notice[] = siteNotices.map((notice) => ({
      text: notice.text,
      href: notice.href ?? undefined,
    }))

    for (const event of upcomingEvents) {
      const date = new Date(event.startAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      items.push({
        text: `${event.title} — ${date}${event.location ? ` · ${event.location}` : ""}`,
        href: "/events",
      })
    }
    if (forumStats && forumStats.newThisWeek > 0) {
      const n = forumStats.newThisWeek
      items.push({
        text: `${n} new discussion topic${n === 1 ? "" : "s"} this week in the Members Forum`,
        href: "/forum",
      })
    }
    for (const thread of latestThreads) {
      items.push({
        text: `New discussion: "${thread.title}" — ${thread.replyCount} ${thread.replyCount === 1 ? "reply" : "replies"}`,
        href: `/forum/${thread.id}`,
      })
    }

    // Live and admin-authored data can both be empty. The ticker should still
    // always be present, so top it up with standing calls-to-action.
    const standing: Notice[] = [
      ...(isAlumni
        ? []
        : [{ text: "Apply for Alumni membership to unlock the full directory, events and forum", href: "/alumni/apply" }]),
      { text: "Join the Members Forum — discuss real trade finance cases with your peers", href: "/forum" },
      { text: "Browse upcoming alumni events, webinars and conferences", href: "/events" },
      { text: "Read the latest articles on UCP 600 and documentary credits", href: "/blogs" },
    ]
    for (const notice of standing) {
      if (items.length >= MIN_NOTICES) break
      items.push(notice)
    }
    return items
  }, [siteNotices, upcomingEvents, forumStats, latestThreads, isAlumni])

  return <NoticeTicker notices={notices} />
}
