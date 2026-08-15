import { cn } from "@/lib/utils"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

interface GateCardProps {
  variant?: "primary" | "outline"
  tag: string
  title: string
  description: string
  buttonLabel: string
  buttonHref: string
  className?: string
}

export function GateCard({
  variant = "outline",
  tag,
  title,
  description,
  buttonLabel,
  buttonHref,
  className,
}: GateCardProps) {
  const isPrimary = variant === "primary"
  return (
    <div
      className={cn(
        "border rounded-xl p-[34px_30px]",
        isPrimary ? "bg-navy border-navy text-white" : "bg-card border-border",
        className
      )}
    >
      <span
        className="text-section-label font-bold block mb-3"
        style={{ color: isPrimary ? "var(--gold-light)" : "var(--gold)" }}
      >
        {tag}
      </span>
      <h3 className={cn("font-heading text-[21px] mb-[10px]", isPrimary ? "text-white" : "text-navy")}>
        {title}
      </h3>
      <p className={cn("text-[13.5px] mb-[22px]", isPrimary ? "text-white/70" : "text-muted-foreground")}>
        {description}
      </p>
      <Link href={buttonHref} className={buttonVariants({ variant: isPrimary ? "default" : "outline-secondary", size: "lg" })}>
        {buttonLabel}
      </Link>
    </div>
  )
}
