import { cn } from "@/lib/utils"
import Link from "next/link"

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
      {isPrimary ? (
        <Link
          href={buttonHref}
          className="inline-block bg-primary text-primary-foreground text-[13.5px] font-semibold px-[22px] py-3 rounded-lg hover:bg-primary/90 transition-opacity"
        >
          {buttonLabel}
        </Link>
      ) : (
        <Link
          href={buttonHref}
          className="inline-block border border-navy text-navy text-[13.5px] font-semibold px-[22px] py-3 rounded-lg hover:bg-navy hover:text-white transition-colors"
        >
          {buttonLabel}
        </Link>
      )}
    </div>
  )
}
