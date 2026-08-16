import { cn } from "@/lib/utils"
import Link from "next/link"
import type { BlogSummary } from "@/lib/api"

interface BlogCardProps extends BlogSummary {
  className?: string
}

export function BlogCard({ title, slug, excerpt, featuredImage, category, readingTime, priceBdt, author, publishedAt, className }: BlogCardProps) {
  return (
    <Link href={`/blogs/${slug}`} className={cn("group relative block bg-card border border-border rounded-xl overflow-hidden hover:border-gold/50 hover:-translate-y-1 transition-all", className)}>
      {priceBdt > 0 && (
        <span className="absolute top-3 right-3 z-10 bg-navy text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
          🔒 Members
        </span>
      )}
      {featuredImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={featuredImage} alt="" className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground/40 text-3xl">📄</div>
      )}
      <div className="p-6">
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
      </div>
    </Link>
  )
}
