import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { SectionHeader } from "@/components/shared/section-header"

interface LegalPageProps {
  eyebrow: string
  title: string
  updated?: string
  children: React.ReactNode
}

// Shared chrome for the standalone informational pages linked from the
// footer (Privacy, Terms, Accreditation, Careers) — consistent header and
// prose container, content differs per page.
export function LegalPage({ eyebrow, title, updated, children }: LegalPageProps) {
  return (
    <>
      <TopNav />
      <main className="pt-20">
        <section className="py-16 bg-background">
          <div className="max-w-[780px] mx-auto px-6">
            <SectionHeader eyebrow={eyebrow} title={title} subtitle={updated ? `Last updated: ${updated}` : undefined} />
            <div className="text-[15px] leading-[1.75] text-foreground">{children}</div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
