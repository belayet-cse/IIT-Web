"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { getEvents, type EventFormat, type EventSummary } from "@/lib/api"

const formatLabels: Record<EventFormat, string> = {
  IN_PERSON: "In Person",
  VIRTUAL: "Virtual",
  HYBRID: "Hybrid",
}

function EventCard({ event }: { event: EventSummary }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {event.featuredImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.featuredImage} alt="" className="w-full h-[140px] object-cover" />
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-navy/8 text-navy text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            {formatLabels[event.format]}
          </span>
          <span className="text-[12px] text-muted-foreground">
            {new Date(event.startAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <h3 className="font-heading text-[16px] text-navy mb-1.5">{event.title}</h3>
        {event.location && <p className="text-[12.5px] text-muted-foreground mb-2">{event.location}</p>}
        <p className="text-[13px] text-muted-foreground line-clamp-3">{event.description}</p>
      </div>
    </div>
  )
}

export function EventsTabs() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")
  const [events, setEvents] = useState<EventSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true)
      getEvents({ when: tab, limit: 12 })
        .then((res) => setEvents(res.data))
        .catch(() => setEvents([]))
        .finally(() => setLoading(false))
    }, 0)
    return () => clearTimeout(timeout)
  }, [tab])

  return (
    <div>
      <div className="flex gap-1 mb-8 border-b border-border justify-center">
        {(["upcoming", "past"] as const).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "px-[18px] py-[11px] text-nav font-semibold cursor-pointer border-b-2 border-transparent transition-colors",
              tab === id ? "text-navy" : "text-muted-foreground hover:text-foreground"
            )}
            style={tab === id ? { borderBottomColor: "var(--gold)" } : undefined}
          >
            {id === "upcoming" ? "Upcoming Events" : "Past Events"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-14">Loading…</p>
      ) : events.length === 0 ? (
        <div className="text-center py-14 max-w-[420px] mx-auto">
          <div className="text-4xl mb-4" aria-hidden>
            📅
          </div>
          <h3 className="font-heading text-[20px] text-navy mb-2">
            No {tab === "upcoming" ? "Upcoming" : "Past"} Events
          </h3>
          <p className="text-sm text-muted-foreground">Please check back later for updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {events.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
