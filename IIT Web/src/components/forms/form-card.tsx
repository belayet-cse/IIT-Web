import { cn } from "@/lib/utils"

interface FormCardProps {
  children: React.ReactNode
  className?: string
}

export function FormCard({ children, className }: FormCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-2xl p-[26px] md:p-10", className)}>
      {children}
    </div>
  )
}
