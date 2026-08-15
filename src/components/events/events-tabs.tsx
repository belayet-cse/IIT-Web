"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function EventsTabs() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")

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

      <div className="text-center py-14 max-w-[420px] mx-auto">
        <div className="text-4xl mb-4" aria-hidden>
          📅
        </div>
        <h3 className="font-heading text-[20px] text-navy mb-2">
          No {tab === "upcoming" ? "Upcoming" : "Past"} Events
        </h3>
        <p className="text-sm text-muted-foreground">Please check back later for updates.</p>
      </div>
    </div>
  )
}
