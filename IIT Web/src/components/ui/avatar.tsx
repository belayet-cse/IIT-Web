import { cn } from "@/lib/utils"

interface AvatarProps {
  initials: string
  size?: "sm" | "md"
  color?: string
  className?: string
}

export function Avatar({ initials, size = "md", color, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-bold flex-shrink-0",
        size === "sm" ? "w-[34px] h-[34px] text-xs" : "w-14 h-14 text-base",
        className
      )}
      style={{ backgroundColor: color ?? "var(--navy)" }}
    >
      {initials}
    </div>
  )
}
