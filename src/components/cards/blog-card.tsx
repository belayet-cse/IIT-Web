import { cn } from "@/lib/utils"
import Link from "next/link"
import type { BlogSummary } from "@/lib/api"

interface BlogCardProps extends BlogSummary {
  className?: string
}

export function BlogCard({ title, slug, excerpt, category, readingTime, author, publishedAt, className }: BlogCardProps) {
  return (
    <Link href={`/blogs/${slug}`} className={cn("group block bg-card border border-border rounded-xl p-6 hover:border-gold/50 hover:-translate-y-1 transition-all", className)}>
      {category && <span className="text-eyebrow text-gold block mb-2">{category}</span>}
      <h3 className="font-heading text-[19px] text-navy group-hover:text-gold transition-colors mb-2 leading-snug">
        {title}
      </h3>
      {excerpt && <p className="text-[13.5px] text-muted-foreground mb-4 line-clamp-3">{excerpt}</p>}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{author}</span>
        <span aria-hidden>·</span>
        <span>{readingTime} min read</span>
        {publishedAt && (
          <>
            <span aria-hidden>·</span>
            <span>{new Date(publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </>
        )}
      </div>
    </Link>
  )
}
