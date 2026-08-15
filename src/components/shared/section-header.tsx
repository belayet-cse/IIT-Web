import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/shared/eyebrow"

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  className?: string
}

export function SectionHeader({ eyebrow, title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn("text-center mb-10", className)}>
      {eyebrow && <Eyebrow variant="dark">{eyebrow}</Eyebrow>}
      <h2 className="font-heading text-[30px] text-navy mb-2">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
