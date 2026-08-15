import { cn } from "@/lib/utils"

type BadgeVariant = "verified" | "pending" | "honorary" | "error"

const variantClass: Record<BadgeVariant, string> = {
  verified: "badge-verified",
  pending: "badge-pending",
  honorary: "badge-honorary",
  error: "badge-error",
}

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn("text-pill inline-block px-[9px] py-[3px] rounded-full", variantClass[variant], className)}>
      {children}
    </span>
  )
}
