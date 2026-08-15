import { cn } from "@/lib/utils"

interface EyebrowProps {
  children: React.ReactNode
  variant?: "light" | "dark"
  className?: string
}

export function Eyebrow({ children, variant = "dark", className }: EyebrowProps) {
  const color = variant === "light" ? "var(--gold-light)" : "var(--gold)"
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-eyebrow mb-[18px]", className)}
      style={{ color }}
    >
      <span className="w-[22px] h-px" style={{ backgroundColor: color }} />
      {children}
      <span className="w-[22px] h-px" style={{ backgroundColor: color }} />
    </span>
  )
}
