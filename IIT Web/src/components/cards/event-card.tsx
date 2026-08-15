import { cn } from "@/lib/utils"
import Link from "next/link"

interface EventCardProps {
  tag: string
  title: string
  description: string
  date: string
  location: string
  rsvpHref?: string
  className?: string
}

export function EventCard({ tag, title, description, date, location, rsvpHref = "#", className }: EventCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl overflow-hidden", className)}>
      <div
        className="h-[130px]"
        style={{ background: "linear-gradient(135deg, #0a1229, #2b3568)" }}
      />
      <div className="p-[18px]">
        <span className="text-[10px] uppercase tracking-wider text-gold font-bold">{tag}</span>
        <h4 className="text-[15px] font-bold text-navy mt-2 mb-[6px] font-sans">{title}</h4>
        <p className="text-xs text-muted-foreground mb-[10px]">{description}</p>
        <div className="text-[11.5px] text-muted-foreground mb-3">
          📅 {date} &nbsp;·&nbsp; {location}
        </div>
        <Link
          href={rsvpHref}
          className="inline-block border border-navy text-navy text-[12.5px] font-semibold px-4 py-2 rounded-lg hover:bg-navy hover:text-white transition-colors"
        >
          RSVP
        </Link>
      </div>
    </div>
  )
}
