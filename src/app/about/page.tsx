import Link from "next/link"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { SectionHeader } from "@/components/shared/section-header"
import { PartnersSection } from "@/components/about/partners-section"

const missionPoints = [
  "Promoting high-quality education and training in international trade",
  "Conducting applied research on trade policy, regulation, and digital transformation",
  "Fostering a global network of trade professionals, scholars, and institutions",
  "Supporting the next generation of trade leaders through mentorship and thought leadership",
  "Advancing the integration of technology in cross-border trade operations",
]

const whoWeServe = [
  "Trade practitioners, bankers, and supply chain professionals",
  "Government officials and policymakers",
  "Researchers, academics, and students",
  "Entrepreneurs and business leaders engaged in cross-border commerce",
]

const differentiators = [
  "Expert-led online and hybrid learning programs",
  "Research publications on trade policy and digital trade trends",
  "Regular insights from global trade experts and industry veterans",
  "A growing network of partners and collaborators in academia, banking, logistics, and government",
  "Emphasis on technology, sustainability, and future-ready trade practices",
]

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-0.5 text-gold flex-shrink-0" aria-hidden>
            ✓
          </span>
          <span className="text-base text-muted-foreground">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function AboutPage() {
  return (
    <>
      <TopNav />
      <main className="pt-20">
        {/* Intro */}
        <section className="py-16 bg-background">
          <div className="max-w-[760px] mx-auto px-6">
            <SectionHeader eyebrow="About Us" title="About IIT" className="mb-6" />
            <p className="text-base text-muted-foreground leading-relaxed text-center">
              Institute of International Trade (IIT) is a center of excellence dedicated to advancing knowledge,
              education, and research in the field of international trade. We combine academic rigor with industry
              insight to equip professionals, students, and institutions with the skills and understanding necessary
              to navigate the evolving landscape of global trade.
            </p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-16 bg-card">
          <div className="max-w-[1180px] mx-auto px-8">
            <SectionHeader eyebrow="Vision & Mission" title="Where We're Headed" className="mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                <h3 className="font-heading text-[22px] text-navy mb-4">Our Vision</h3>
                <p className="text-base text-muted-foreground">
                  To become a trusted global platform for trade education and research, bridging traditional trade
                  practices with the demands of a digital economy.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-[22px] text-navy mb-4">Our Mission</h3>
                <CheckList items={missionPoints} />
              </div>
            </div>
          </div>
        </section>

        {/* Who We Serve */}
        <section className="py-16 bg-background">
          <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="text-eyebrow text-gold block mb-4">Who We Serve</span>
              <h2 className="font-heading text-[28px] text-navy mb-4">
                Designed for Everyone Shaping Global Trade
              </h2>
              <p className="text-base text-muted-foreground">Our programs and initiatives are designed for:</p>
            </div>
            <div>
              <CheckList items={whoWeServe} />
              <p className="text-base text-muted-foreground mt-6">
                Whether you are an experienced professional or an emerging leader in trade, IIT provides the tools,
                resources, and community to help you excel.
              </p>
            </div>
          </div>
        </section>

        {/* What Sets Us Apart */}
        <section className="py-16 bg-card">
          <div className="max-w-[1180px] mx-auto px-8">
            <SectionHeader title="What Sets Us Apart" className="mb-10" />
            <div className="max-w-[720px] mx-auto">
              <CheckList items={differentiators} />
            </div>
          </div>
        </section>

        {/* Partners & Collaborators */}
        <PartnersSection />

        {/* CTA Banner */}
        <section
          className="py-20 text-center text-white"
          style={{ background: "linear-gradient(135deg, var(--navy-surface), var(--navy))" }}
        >
          <div className="max-w-[640px] mx-auto px-6">
            <h2 className="font-heading text-[32px] text-white mb-4">
              Ready to Advance Your Career in International Trade?
            </h2>
            <p className="text-base text-white/75 mb-8">
              Join thousands of professionals who have transformed their careers through our specialized
              programs and industry-recognized certifications.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/programs"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-nav hover:bg-primary/90 transition-opacity"
              >
                Browse Programs
              </Link>
              <Link
                href="/contact"
                className="bg-transparent border border-white/60 text-white px-6 py-3 rounded-lg text-nav hover:bg-white/10 transition-colors"
              >
                Request Information
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-14 bg-card text-center">
          <div className="max-w-[460px] mx-auto px-6">
            <h3 className="font-heading text-[22px] text-navy mb-2">Stay Informed</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Subscribe to our newsletter for the latest insights, research, and industry updates.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                required
                className="flex-1 px-4 py-3 rounded-lg border border-border text-sm outline-none focus-halo"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-nav hover:bg-primary/90 transition-opacity whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-muted-foreground/70 mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from IIT.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
