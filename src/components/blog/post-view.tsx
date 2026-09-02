"use client"

import { useState } from "react"
import Link from "next/link"
import { Share2 } from "lucide-react"

export interface PostViewProps {
  title: string
  category?: string | null
  subCategory?: string | null
  author: string
  readingTime: number
  publishedAt?: string | Date | null
  featuredImage?: string | null
  content: string | null
  tags?: string[]
  views?: number
  claps?: number
  locked?: boolean
  showBackLink?: boolean
  /** Rendered in place of the article body when the post is gated (content is null). */
  lockedContent?: React.ReactNode
}

// Exact colors measured from the reference design (iitrade.org blog detail page).
const COLOR_BADGE = "#020617"
const COLOR_HEADING = "#1c2024"
const COLOR_AUTHOR = "#003366"
const COLOR_CATEGORY_BG = "#0a66c2"
const COLOR_CATEGORY_TEXT = "#f8fafc"
const COLOR_BODY = "#333333"

const badgeOutline =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
const badgeOutlineStyle = { color: COLOR_BADGE, borderColor: COLOR_BADGE }
const badgeSolid = "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold"
const badgeSolidStyle = { backgroundColor: COLOR_CATEGORY_BG, color: COLOR_CATEGORY_TEXT }

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

// Same clap glyph as the reference design.
function ClapIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-label="clap" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.37.828 12 3.282l.63-2.454zM13.916 3.953l1.523-2.112-1.184-.39zM8.589 1.84l1.522 2.112-.337-2.501zM18.523 18.92c-.86.86-1.75 1.246-2.62 1.33a6 6 0 0 0 .407-.372c2.388-2.389 2.86-4.951 1.399-7.623l-.912-1.603-.79-1.672c-.26-.56-.194-.98.203-1.288a.7.7 0 0 1 .546-.132c.283.046.546.231.728.5l2.363 4.157c.976 1.624 1.141 4.237-1.324 6.702m-10.999-.438L3.37 14.328a.828.828 0 0 1 .585-1.408.83.83 0 0 1 .585.242l2.158 2.157a.365.365 0 0 0 .516-.516l-2.157-2.158-1.449-1.449a.826.826 0 0 1 1.167-1.17l3.438 3.44a.363.363 0 0 0 .516 0 .364.364 0 0 0 0-.516L5.293 9.513l-.97-.97a.826.826 0 0 1 0-1.166.84.84 0 0 1 1.167 0l.97.968 3.437 3.436a.36.36 0 0 0 .517 0 .366.366 0 0 0 0-.516L6.977 7.83a.82.82 0 0 1-.241-.584.82.82 0 0 1 .824-.826c.219 0 .43.087.584.242l5.787 5.787a.366.366 0 0 0 .587-.415l-1.117-2.363c-.26-.56-.194-.98.204-1.289a.7.7 0 0 1 .546-.132c.283.046.545.232.727.501l2.193 3.86c1.302 2.38.883 4.59-1.277 6.75-1.156 1.156-2.602 1.627-4.19 1.367-1.418-.236-2.866-1.033-4.079-2.246M10.75 5.971l2.12 2.12c-.41.502-.465 1.17-.128 1.89l.22.465-3.523-3.523a.8.8 0 0 1-.097-.368c0-.22.086-.428.241-.584a.847.847 0 0 1 1.167 0m7.355 1.705c-.31-.461-.746-.758-1.23-.837a1.44 1.44 0 0 0-1.11.275c-.312.24-.505.543-.59.881a1.74 1.74 0 0 0-.906-.465 1.47 1.47 0 0 0-.82.106l-2.182-2.182a1.56 1.56 0 0 0-2.2 0 1.54 1.54 0 0 0-.396.701 1.56 1.56 0 0 0-2.21-.01 1.55 1.55 0 0 0-.416.753c-.624-.624-1.649-.624-2.237-.037a1.557 1.557 0 0 0 0 2.2c-.239.1-.501.238-.715.453a1.56 1.56 0 0 0 0 2.2l.516.515a1.556 1.556 0 0 0-.753 2.615L7.01 19c1.32 1.319 2.909 2.189 4.475 2.449q.482.08.971.08c.85 0 1.653-.198 2.393-.579.231.033.46.054.686.054 1.266 0 2.457-.52 3.505-1.567 2.763-2.763 2.552-5.734 1.439-7.586z"
      />
    </svg>
  )
}

// Same eye glyph as the reference design.
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
    </svg>
  )
}

// Shared between the public post page and the admin "Preview" modal so the
// two render identically — the writer sees exactly what a reader would see.
// Preview always passes full content, so `lockedContent` never applies there.
export function PostView({
  title,
  category,
  subCategory,
  author,
  readingTime,
  publishedAt,
  featuredImage,
  content,
  tags = [],
  views = 0,
  claps = 0,
  locked = false,
  showBackLink = true,
  lockedContent,
}: PostViewProps) {
  const [shareMessage, setShareMessage] = useState("")
  const isHtml = !!content && /<\/?[a-z][\s\S]*>/i.test(content)
  const paragraphs = content && !isHtml ? content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean) : []

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // user cancelled the native share sheet — nothing to do
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareMessage("Link copied!")
      setTimeout(() => setShareMessage(""), 2000)
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {featuredImage && (
        <div className="relative overflow-hidden group">
          <div
            className="h-[480px] w-full scale-125 relative z-10 transition-all duration-1000 group-hover:blur-sm group-hover:scale-110"
            style={{
              backgroundImage: `url("${featuredImage}")`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              filter: "blur(24px) brightness(0.7)",
            }}
          />
          <div className="absolute h-full top-0 left-0 right-0 bottom-0 w-full z-40 mx-auto overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full mx-auto object-contain transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-5xl py-10">
        <header className="mb-12">
          <div className={`${badgeOutline} mb-4`} style={badgeOutlineStyle}>
            {locked ? "Members Only" : "Free"}
          </div>

          <h1
            className="font-sans text-3xl md:text-4xl font-bold mb-6 leading-tight"
            style={{ color: COLOR_HEADING }}
          >
            {title}
          </h1>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-sm font-medium text-gray-600">
                {initials(author)}
              </div>
              <div>
                <p className="font-medium" style={{ color: COLOR_AUTHOR }}>
                  {author}
                </p>
                <p className="text-sm text-gray-500">
                  {publishedAt &&
                    new Date(publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  {publishedAt && " · "}
                  {readingTime} min read
                </p>
              </div>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {tags.map((tag) => (
                <span key={tag} className={badgeOutline} style={badgeOutlineStyle}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div
            className="flex items-center gap-8 border-t border-b py-4 my-6 text-sm font-medium select-none"
            style={{ borderColor: "#4b5563", color: "#4b5563" }}
          >
            <div className="flex items-center gap-x-2">
              <div className="bg-gray-200 gap-2 px-2 py-1 rounded-full">
                <ClapIcon />
              </div>
              <span>{claps}</span>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="bg-gray-200 gap-2 w-8 h-8 flex items-center justify-center px-2 py-1 rounded-full">
                <EyeIcon className="w-4 h-4" />
              </div>
              <span>{views}</span>
            </div>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity ml-auto"
            >
              <Share2 className="w-4 h-4" />
              {shareMessage || "Share"}
            </button>
          </div>
        </header>

        <div className="relative">
          <article className="max-w-none mb-16 rich-content text-[16px]" style={{ color: COLOR_BODY }}>
            {content === null ? (
              lockedContent
            ) : isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              paragraphs.map((paragraph, i) => (
                <p key={i} className="text-[16px] leading-[1.75] mb-5" style={{ color: COLOR_BODY }}>
                  {paragraph}
                </p>
              ))
            )}
          </article>
        </div>

        {(category || subCategory) && (
          <div className="py-2">
            <h2 className="font-sans text-2xl font-bold mb-4" style={{ color: COLOR_HEADING }}>
              Categories
            </h2>
            <div className="flex flex-wrap gap-2 mb-12">
              {category && (
                <span className={badgeSolid} style={badgeSolidStyle}>
                  {category}
                </span>
              )}
              {subCategory && (
                <span className={badgeSolid} style={badgeSolidStyle}>
                  {subCategory}
                </span>
              )}
            </div>
          </div>
        )}

        {showBackLink && (
          <div className="pt-8 border-t border-border">
            <Link href="/blogs" className="text-gold text-nav hover:underline">
              ← Back to all posts
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
