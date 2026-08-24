import { Eye, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { BlogSummary } from "@/lib/api"

interface BlogCardProps extends BlogSummary {
  className?: string
}

export function BlogCard({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  readingTime,
  priceBdt,
  priceUsd,
  views,
  author,
  publishedAt,
  className,
}: BlogCardProps) {
  const isPaid = priceBdt > 0 || priceUsd > 0

  return (
    <Link
      href={`/blogs/${slug}`}
      className={cn(
        "group block bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-gold/50 transition-all duration-200",
        className
      )}
    >
      <div className="relative h-48 overflow-hidden">
        {featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImage}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground/40 text-3xl">
            📄
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-[13px] font-semibold flex items-center gap-1">
            Read more <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3 gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold",
              isPaid ? "bg-navy text-white" : "bg-blue-500 text-white"
            )}
          >
            {isPaid ? "Premium" : "Free"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[12px] font-semibold text-muted-foreground flex-shrink-0">
            <Eye className="w-3.5 h-3.5" />
            {views}
          </span>
        </div>

        {category && <span className="text-eyebrow text-gold block mb-1.5">{category}</span>}

        <h3 className="font-heading text-[17px] text-navy group-hover:text-gold transition-colors mb-2 leading-snug line-clamp-2">
          {title}
        </h3>

        {excerpt && <p className="text-[13px] text-muted-foreground mb-4 line-clamp-2">{excerpt}</p>}

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground min-w-0">
            <span className="truncate">{author}</span>
            <span aria-hidden>·</span>
            <span className="flex-shrink-0">{readingTime} min read</span>
          </div>
          <span className="text-gold text-[12px] font-semibold flex-shrink-0">Read article →</span>
        </div>

        {publishedAt && (
          <div className="text-[11px] text-muted-foreground/70 mt-1.5">
            {new Date(publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        )}
      </div>
    </Link>
  )
}
