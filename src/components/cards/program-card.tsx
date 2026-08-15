import { cn } from "@/lib/utils"
import Link from "next/link"

interface ProgramCardProps {
  code: string
  title: string
  description: string
  href?: string
  className?: string
}

export function ProgramCard({ code, title, description, href = "#", className }: ProgramCardProps) {
  return (
    <div className={cn(
      "bg-card border border-border rounded-lg p-10 hover:border-gold/50 transition-colors group",
      className
    )}>
      <h3 className="font-heading text-[21px] text-navy mb-1">{code}</h3>
      <p className="text-xs text-muted-foreground font-semibold mb-3">{title}</p>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      <Link href={href} className="text-gold text-nav group-hover:underline">
        Learn More
      </Link>
    </div>
  )
}
