import { cn } from "@/lib/utils"

interface TopbarProps {
  title: string
  actions?: React.ReactNode
  className?: string
}

export function Topbar({ title, actions, className }: TopbarProps) {
  return (
    <div className={cn("bg-card border-b border-border px-8 py-[18px] flex justify-between items-center", className)}>
      <h1 className="font-heading text-[22px] text-navy">{title}</h1>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
