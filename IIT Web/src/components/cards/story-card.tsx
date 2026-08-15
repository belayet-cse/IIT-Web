import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"

interface StoryCardProps {
  initials: string
  quote: string
  name: string
  role: string
  className?: string
}

export function StoryCard({ initials, quote, name, role, className }: StoryCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
      <Avatar initials={initials} className="mb-[14px]" />
      <p className="text-[13px] text-foreground italic mb-[14px]">&ldquo;{quote}&rdquo;</p>
      <div className="text-[12.5px] font-bold text-navy">{name}</div>
      <div className="text-[11.5px] text-muted-foreground">{role}</div>
    </div>
  )
}
