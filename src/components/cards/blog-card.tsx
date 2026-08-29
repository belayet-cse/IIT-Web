import { Eye, ArrowUpRight, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { BlogSummary } from "@/lib/api"

interface BlogCardProps extends BlogSummary {
  className?: string
}

function CardImage({ featuredImage, title }: { featuredImage: string | null; title: string }) {
  if (featuredImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={featuredImage}
        alt=""
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    )
  }
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-surface) 100%)" }}
    >
      <FileText className="w-8 h-8" style={{ color: "var(--gold)", opacity: 0.5 }} aria-label={title} />
    </div>
  )
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
        "group block bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <CardImage featuredImage={featuredImage} title={title} />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-sm",
              isPaid ? "bg-navy text-white" : "bg-white/95 text-navy"
            )}
          >
            {isPaid ? "Premium" : "Free"}
          </span>
          {category && (
            <span className="inline-flex items-center rounded-full bg-black/45 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white tracking-wide">
              {category}
            </span>
          )}
        </div>

        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/45 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white">
          <Eye className="w-3 h-3" />
          {views}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-heading text-[18px] text-navy group-hover:text-gold transition-colors mb-2 leading-snug line-clamp-2">
          {title}
        </h3>

        {excerpt && <p className="text-[13.5px] leading-relaxed text-muted-foreground mb-4 line-clamp-2">{excerpt}</p>}

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="min-w-0 text-[11.5px] text-muted-foreground">
            <span className="font-medium text-foreground/80 truncate">{author}</span>
            <span className="mx-1.5" aria-hidden>
              ·
            </span>
            {publishedAt && (
              <>
                {new Date(publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                <span className="mx-1.5" aria-hidden>
                  ·
                </span>
              </>
            )}
            {readingTime} min read
          </div>
          <ArrowUpRight className="w-4 h-4 text-gold flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  )
}
