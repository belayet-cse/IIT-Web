import { cn } from "@/lib/utils"

interface InfoNoteProps {
  children: React.ReactNode
  className?: string
}

export function InfoNote({ children, className }: InfoNoteProps) {
  return (
    <div className={cn("bg-background border border-border rounded-xl p-[18px_20px] text-[12.5px] text-muted-foreground [&_b]:text-navy [&_b]:font-semibold [&_a]:text-navy [&_a]:font-semibold", className)}>
      {children}
    </div>
  )
}
