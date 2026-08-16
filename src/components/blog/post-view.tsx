import Link from "next/link"
import { Eyebrow } from "@/components/shared/eyebrow"

export interface PostViewProps {
  title: string
  category?: string | null
  author: string
  readingTime: number
  publishedAt?: string | Date | null
  featuredImage?: string | null
  content: string | null
  showBackLink?: boolean
  /** Rendered in place of the article body when the post is gated (content is null). */
  lockedContent?: React.ReactNode
}

// Shared between the public post page and the admin "Preview" modal so the
// two render identically — the writer sees exactly what a reader would see.
// Preview always passes full content, so `lockedContent` never applies there.
export function PostView({
  title,
  category,
  author,
  readingTime,
  publishedAt,
  featuredImage,
  content,
  showBackLink = true,
  lockedContent,
}: PostViewProps) {
  const isHtml = !!content && /<\/?[a-z][\s\S]*>/i.test(content)
  const paragraphs = content && !isHtml ? content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean) : []

  return (
    <>
      <section
        className="relative overflow-hidden text-white text-center py-[64px] pb-[44px]"
        style={{
          background:
            "linear-gradient(160deg, rgba(10,18,41,.94), rgba(10,18,41,.86)), radial-gradient(circle at 80% 20%, rgba(201,168,76,.18), transparent 55%)",
        }}
      >
        <div className="relative z-10 max-w-[760px] mx-auto px-6">
          {category && <Eyebrow variant="light">{category}</Eyebrow>}
          <h1 className="font-heading text-[34px] font-bold text-white mb-4 leading-tight">{title}</h1>
          <div className="flex items-center justify-center gap-2 text-[13px]" style={{ color: "#c7cbe0" }}>
            <span>{author}</span>
            <span aria-hidden>·</span>
            <span>{readingTime} min read</span>
            {publishedAt && (
              <>
                <span aria-hidden>·</span>
                <span>
                  {new Date(publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {featuredImage && (
        <div className="max-w-[820px] mx-auto px-6 -mt-8 relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={featuredImage}
            alt=""
            className="w-full max-h-[420px] object-cover rounded-xl border border-border shadow-lg"
          />
        </div>
      )}

      <article className="py-16">
        <div className="max-w-[720px] mx-auto px-6">
          {content === null ? (
            lockedContent
          ) : isHtml ? (
            <div className="rich-content text-[16px] text-foreground" dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            paragraphs.map((paragraph, i) => (
              <p key={i} className="text-[16px] leading-[1.75] text-foreground mb-5">
                {paragraph}
              </p>
            ))
          )}

          {showBackLink && (
            <div className="mt-12 pt-8 border-t border-border">
              <Link href="/blogs" className="text-gold text-nav hover:underline">
                ← Back to all posts
              </Link>
            </div>
          )}
        </div>
      </article>
    </>
  )
}
