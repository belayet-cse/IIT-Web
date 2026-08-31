import type { Metadata } from "next"
import { getBlogBySlug } from "@/lib/api"
import BlogPostClient from "./blog-post-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"
const API_ORIGIN = API_URL.replace(/\/api$/, "")

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const post = await getBlogBySlug(slug).catch(() => null)
  if (!post) {
    return { title: "Post not found" }
  }

  const title = post.metaTitle || post.title
  const description =
    post.metaDescription || post.excerpt || "Read this article on the IIT blog."
  const image = post.featuredImage
    ? { url: `${API_ORIGIN}/blogs/${slug}/og-image`, width: 1200, height: 630, alt: title }
    : { url: "/opengraph-image", width: 1200, height: 630, alt: title }

  return {
    title,
    description,
    alternates: { canonical: `/blogs/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blogs/${slug}`,
      publishedTime: post.publishedAt ?? undefined,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  }
}

export default function BlogPostPage() {
  return <BlogPostClient />
}
