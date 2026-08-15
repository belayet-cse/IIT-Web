import { cn } from "@/lib/utils"
import Link from "next/link"

interface NewsCardProps {
  tag: string
  title: string
  date: string
  href?: string
  placeholderIcon?: React.ReactNode
  className?: string
}

export function NewsCard({ tag, title, date, href = "#", placeholderIcon, className }: NewsCardProps) {
  return (
    <Link href={href} className={cn("group block cursor-pointer", className)}>
      <div className="mb-4 overflow-hidden rounded-lg bg-muted h-48 border border-border flex items-center justify-center">
        {placeholderIcon ?? <span className="text-4xl text-muted-foreground/40">📄</span>}
      </div>
      <span className="text-eyebrow text-gold block mb-2">{tag}</span>
      <h3 className="text-[15px] font-semibold text-navy group-hover:text-gold transition-colors font-sans">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground mt-2">{date}</p>
    </Link>
  )
}
