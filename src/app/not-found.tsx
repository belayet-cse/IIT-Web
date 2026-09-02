import Link from "next/link"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/shared/hero"

export default function NotFound() {
  return (
    <>
      <TopNav />
      <main className="pt-20">
        <Hero
          eyebrow="Coming Soon"
          title="This page is on its way"
          subtitle="We're still building this part of the site. Check back soon, or head somewhere that's already live."
        >
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-sm text-nav hover:bg-primary/90 transition-opacity"
            >
              Back to Home
            </Link>
            <Link
              href="/blogs"
              className="inline-flex items-center justify-center bg-transparent border border-white/60 text-white px-6 py-3 rounded-sm text-nav hover:bg-white/10 transition-colors"
            >
              Read the Blog
            </Link>
          </div>
        </Hero>
      </main>
      <Footer />
    </>
  )
}
