"use client"

import { useEffect, useState } from "react"
import { SectionHeader } from "@/components/shared/section-header"
import { getEvents, type EventSummary } from "@/lib/api"

export function FeaturedEventSection() {
  const [event, setEvent] = useState<EventSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvents({ when: "upcoming", featured: true, limit: 1 })
      .then((res) => setEvent(res.data[0] ?? null))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !event) return null

  return (
    <section className="py-16 bg-card">
      <div className="max-w-[1180px] mx-auto px-8">
        <SectionHeader eyebrow="Featured Event" title="Don't Miss Our Flagship Conference of the Year" className="mb-10" />
        <FeaturedEventCard event={event} />
      </div>
    </section>
  )
}

function FeaturedEventCard({ event }: { event: EventSummary }) {
  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden max-w-[880px] mx-auto md:grid md:grid-cols-2">
      {event.featuredImage ? (
        <div className="h-[220px] md:h-full bg-cover bg-center" style={{ backgroundImage: `url(${event.featuredImage})` }} />
      ) : (
        <div className="h-[220px] md:h-full bg-navy/5" />
      )}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-gold/15 text-gold text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            Featured
          </span>
          <span className="text-[12.5px] text-muted-foreground">
            {new Date(event.startAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <h3 className="font-heading text-[22px] text-navy mb-2">{event.title}</h3>
        {event.location && <p className="text-[13px] text-muted-foreground mb-4">{event.location}</p>}
        <p className="text-sm text-muted-foreground">{event.description}</p>
      </div>
    </div>
  )
}
