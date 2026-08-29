import { Eye, ArrowRight, FileText } from "lucide-react"
import Link from "next/link"
import type { BlogSummary } from "@/lib/api"

export function FeaturedBlogCard({
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
}: BlogSummary) {
  const isPaid = priceBdt > 0 || priceUsd > 0

  return (
    <Link
      href={`/blogs/${slug}`}
      className="group grid md:grid-cols-2 bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 mb-12"
    >
      <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
        {featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImage}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-surface) 100%)" }}
          >
            <FileText className="w-12 h-12" style={{ color: "var(--gold)", opacity: 0.5 }} />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center p-8 md:p-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-eyebrow text-gold">Latest</span>
          {category && (
            <>
              <span className="text-muted-foreground/50" aria-hidden>
                ·
              </span>
              <span className="text-eyebrow text-muted-foreground">{category}</span>
            </>
          )}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ml-auto ${
              isPaid ? "bg-navy text-white" : "bg-blue-500 text-white"
            }`}
          >
            {isPaid ? "Premium" : "Free"}
          </span>
        </div>

        <h2 className="font-heading text-[26px] md:text-[30px] text-navy group-hover:text-gold transition-colors mb-4 leading-tight">
          {title}
        </h2>

        {excerpt && <p className="text-[14.5px] leading-relaxed text-muted-foreground mb-6 line-clamp-3">{excerpt}</p>}

        <div className="flex items-center justify-between gap-4 pt-5 border-t border-border">
          <div className="text-[12.5px] text-muted-foreground">
            <span className="font-medium text-foreground/80">{author}</span>
            <span className="mx-1.5" aria-hidden>
              ·
            </span>
            {publishedAt && (
              <>
                {new Date(publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                <span className="mx-1.5" aria-hidden>
                  ·
                </span>
              </>
            )}
            {readingTime} min read
            <span className="mx-1.5" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1 align-middle">
              <Eye className="w-3 h-3" />
              {views}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-gold text-[13px] font-semibold flex-shrink-0">
            Read article
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}
