import { cn } from "@/lib/utils"
import Link from "next/link"

interface ForumBannerProps {
  title: string
  description: string
  buttonLabel: string
  buttonHref: string
  className?: string
}

export function ForumBanner({ title, description, buttonLabel, buttonHref, className }: ForumBannerProps) {
  return (
    <div className={cn("bg-navy rounded-2xl p-[44px_40px] flex items-center justify-between gap-6 text-white", className)}>
      <div>
        <h3 className="font-heading text-[24px] text-white mb-2">{title}</h3>
        <p className="text-sm max-w-[480px]" style={{ color: "#c7cbe0" }}>{description}</p>
      </div>
      <Link
        href={buttonHref}
        className="whitespace-nowrap flex-shrink-0 bg-primary text-primary-foreground text-nav font-semibold px-5 py-2.5 rounded-sm hover:bg-primary/90 transition-opacity"
      >
        {buttonLabel} &rarr;
      </Link>
    </div>
  )
}
