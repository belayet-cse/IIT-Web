import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"

interface StoryCardProps {
  initials: string
  quote: string
  name: string
  role: string
  /** Use on dark/navy backgrounds — flips text to light so it stays readable. */
  dark?: boolean
  className?: string
}

export function StoryCard({ initials, quote, name, role, dark, className }: StoryCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
      <Avatar initials={initials} className="mb-[14px]" />
      <p className={cn("text-[13px] italic mb-[14px]", dark ? "text-white/85" : "text-foreground")}>
        &ldquo;{quote}&rdquo;
      </p>
      <div className={cn("text-[12.5px] font-bold", dark ? "text-white" : "text-navy")}>{name}</div>
      <div className={cn("text-[11.5px]", dark ? "text-white/60" : "text-muted-foreground")}>{role}</div>
    </div>
  )
}
