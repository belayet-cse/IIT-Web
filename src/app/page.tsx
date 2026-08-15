import Link from "next/link"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/shared/hero"
import { StatBar } from "@/components/shared/stat-bar"
import { ProgramCard } from "@/components/cards/program-card"
import { NewsCard } from "@/components/cards/news-card"

export default function HomePage() {
  return (
    <>
      <TopNav />
      <main className="pt-20">

        {/* Hero */}
        <Hero
          title="Shaping the Future of Global Trade Finance"
          subtitle="The premier institution for professional certification, research, and community in international trade services."
          className="min-h-[560px] flex flex-col justify-center"
        >
          <div className="flex gap-4 justify-center flex-wrap mt-8">
            <Link
              href="/programs"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-nav hover:bg-primary/90 transition-opacity"
            >
              Explore Programs
            </Link>
            <Link
              href="/alumni"
              className="bg-transparent border border-primary text-primary px-6 py-3 rounded-lg text-nav hover:bg-primary/10 transition-colors"
            >
              Join Alumni Network
            </Link>
          </div>
        </Hero>

        {/* Global Impact Stats */}
        <StatBar
          stats={[
            { value: "5000+", label: "Certified Professionals" },
            { value: "45+", label: "Countries Represented" },
            { value: "12", label: "Founding Institutions" },
            { value: "98%", label: "Career Advancement Rate" },
          ]}
        />

        {/* About IIT */}
        <section className="py-16 bg-background">
          <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-eyebrow text-gold block mb-4">About Us</span>
              <h2 className="font-heading text-[30px] text-navy mb-6">
                Bridging Theory and Practice in Trade Finance
              </h2>
              <p className="text-base text-muted-foreground mb-6">
                The Institute of International Trade is dedicated to advancing the standards of global trade
                finance through rigorous certification, cutting-edge research, and a global professional network.
                We equip practitioners with the knowledge to navigate complex international markets.
              </p>
              <Link href="/about" className="text-gold text-nav hover:opacity-80 transition-opacity">
                Read Our Story →
              </Link>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-border aspect-[4/3] bg-muted flex items-center justify-center">
              <span className="text-muted-foreground/30 text-7xl select-none">🏛️</span>
            </div>
          </div>
        </section>

        {/* Programs & Certifications */}
        <section className="py-16 bg-card">
          <div className="max-w-[1180px] mx-auto px-8">
            <div className="text-center mb-16">
              <span className="text-eyebrow text-gold block mb-4">Education</span>
              <h2 className="font-heading text-[30px] text-navy">Professional Certifications</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
              <ProgramCard
                code="CDCS"
                title="Certified Documentary Credit Specialist"
                description="The global standard for documentary credit practitioners."
                href="/programs/cdcs"
              />
              <ProgramCard
                code="CSDG"
                title="Certificate for Specialists in Demand Guarantees"
                description="Mastering the rules and practices of demand guarantees."
                href="/programs/csdg"
              />
              <ProgramCard
                code="CITF"
                title="Certificate in International Trade and Finance"
                description="A comprehensive overview of trade finance products."
                href="/programs/citf"
              />
            </div>
          </div>
        </section>

        {/* Alumni Network — dark section */}
        <section className="py-16 bg-navy text-white">
          <div className="max-w-[1180px] mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16">
              <div className="max-w-2xl">
                <span className="text-eyebrow block mb-4" style={{ color: "var(--gold)" }}>
                  Community
                </span>
                <h2 className="font-heading text-[30px] text-white mb-4">
                  A Global Network of Excellence
                </h2>
                <p className="text-base text-white/70 max-w-xl">
                  Join thousands of certified professionals leading the advancement of global trade finance
                  across top institutions worldwide.
                </p>
              </div>
              <Link
                href="/alumni"
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-nav hover:bg-primary/90 transition-opacity mt-6 md:mt-0 whitespace-nowrap flex-shrink-0"
              >
                View Directory
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#2b3040] rounded-lg p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 border-2"
                    style={{ backgroundColor: "var(--navy-surface)", borderColor: "var(--gold)" }}
                  >
                    SK
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white">Sarah Khan</h4>
                    <p className="text-sm text-white/60">Senior Trade Manager</p>
                  </div>
                </div>
                <p className="text-base text-white/70 italic">
                  "The CDCS certification fundamentally elevated my technical understanding of complex credit
                  structures, directly contributing to my recent promotion and allowing me to serve our
                  multinational clients with greater authority."
                </p>
              </div>
              <div className="bg-[#2b3040] rounded-lg p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0 border-2"
                    style={{ backgroundColor: "var(--navy-surface)", borderColor: "var(--gold)" }}
                  >
                    DC
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white">David Chen</h4>
                    <p className="text-sm text-white/60">Trade Analyst</p>
                  </div>
                </div>
                <p className="text-base text-white/70 italic">
                  "Connecting with the IIT alumni network has been invaluable. The exchange of practical
                  insights regarding emerging market regulations has given our team a significant
                  competitive edge."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Insights */}
        <section className="py-16 bg-background">
          <div className="max-w-[1180px] mx-auto px-8">
            <div className="flex justify-between items-end mb-12">
              <h2 className="font-heading text-[30px] text-navy">Latest Insights</h2>
              <Link href="/news" className="text-gold text-nav hover:underline">
                View All News
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <NewsCard
                tag="Research"
                title="The Impact of Digitalization on Documentary Credits in 2024"
                date="Oct 15, 2024"
                href="/news/digitalization"
              />
              <NewsCard
                tag="Event"
                title="Annual Global Trade Finance Summit — London Highlights"
                date="Sep 28, 2024"
                href="/news/summit"
              />
              <NewsCard
                tag="Update"
                title="Updates to the CSDG Syllabus for the Upcoming Exam Cycle"
                date="Sep 10, 2024"
                href="/news/csdg-syllabus"
              />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
