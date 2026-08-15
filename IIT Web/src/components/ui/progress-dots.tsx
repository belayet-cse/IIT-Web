import { cn } from "@/lib/utils"

interface ProgressDotsProps {
  steps: number
  current: number
  className?: string
}

export function ProgressDots({ steps, current, className }: ProgressDotsProps) {
  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {Array.from({ length: steps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-[34px] h-1 rounded-[3px] transition-colors",
            i < current ? "bg-primary" : "bg-border"
          )}
        />
      ))}
    </div>
  )
}
