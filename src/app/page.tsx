import Image from "next/image"
import Link from "next/link"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { HeroSlider } from "@/components/shared/hero-slider"
import { StatBar } from "@/components/shared/stat-bar"
import { SectionHeader } from "@/components/shared/section-header"
import { Eyebrow } from "@/components/shared/eyebrow"
import { ProgramCard } from "@/components/cards/program-card"
import { EventCard } from "@/components/cards/event-card"
import { NewsCard } from "@/components/cards/news-card"
import { StoryCard } from "@/components/cards/story-card"
import { Avatar } from "@/components/ui/avatar"

const slides = [
  {
    tag: "Certification Programs",
    title: "Advancing International Trade Expertise",
    subtitle:
      "Comprehensive training and certification programs designed by industry leaders and experts.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80",
    btn1: { label: "Explore Programs", href: "/programs" },
    btn2: { label: "Learn More", href: "/about" },
  },
  {
    tag: "Research",
    title: "Research Excellence in Global Trade",
    subtitle:
      "Access cutting-edge industry insights, publications, and research from leading trade experts.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80",
    btn1: { label: "View Publications", href: "/research" },
    btn2: { label: "View Programs", href: "/programs" },
  },
  {
    tag: "Community",
    title: "Join Our Alumni Network",
    subtitle:
      "Connect with certified professionals leading the advancement of global trade finance worldwide.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=80",
    btn1: { label: "Alumni Directory", href: "/alumni" },
    btn2: { label: "Apply Now", href: "/alumni/apply" },
  },
]

interface CoFounder {
  name: string
  title: string
  linkedin: string
  photo?: string
}

const coFounders: CoFounder[] = [
  {
    name: "ATM Nesarul Hoque",
    title: "Co-Founder & Director",
    linkedin: "https://www.linkedin.com/in/atm-nesarul-hoque-38593b13/",
    photo: "/ATM_NESARUL_HAQUE.Jpeg",
  },
  {
    name: "Md Tanveer Bin Hasan",
    title: "Co-Founder & Director",
    linkedin: "https://www.linkedin.com/in/md-tanveer-bin-hasan-pmp-cdcs-cspo-csdg-cdts-ceeb-39a88b3b/",
    photo: "/Md_Tanveer_Bin_Hasan.jpeg",
  },
  {
    name: "Md Belayet Hossain",
    title: "Co-Founder & Director",
    linkedin: "https://www.linkedin.com/in/mohammad-belayet-hossain/",
    photo: "/Md_Belayet_hossain.jpeg",
  },
]

// Bangladeshi given names commonly carry an honorific first token (Md, ATM, etc.);
// skip it so initials reflect the person's actual name rather than the honorific.
function founderInitials(name: string) {
  const tokens = name.trim().split(/\s+/)
  const first = tokens.length > 2 ? tokens[1] : tokens[0]
  const last = tokens[tokens.length - 1]
  return `${first[0]}${last[0]}`.toUpperCase()
}

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/institute-of-international-trade-iit/about/" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61577748026721" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCAe6sZU944oeLVGQ2bOsehg" },
]

export default function HomePage() {
  return (
    <>
      <TopNav />
      <main className="pt-20">

        {/* Hero Slider */}
        <HeroSlider slides={slides} />

        {/* Global Impact Stats */}
        <StatBar
          stats={[
            { value: "5000+", label: "Certified Professionals" },
            { value: "45+", label: "Countries Represented" },
            { value: "12", label: "Founding Institutions" },
            { value: "98%", label: "Career Advancement Rate" },
          ]}
        />

        {/* Quick Access */}
        <section className="py-16 bg-background">
          <div className="max-w-[1180px] mx-auto px-8">
            <SectionHeader
              eyebrow="Quick Access"
              title="Popular Resources & Services"
              subtitle="Jump straight to what you're looking for."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
              <Link
                href="/programs"
                className="bg-card border border-border rounded-lg p-8 text-center hover:border-gold/50 hover:-translate-y-1 transition-all"
              >
                <div className="text-4xl mb-3">📜</div>
                <h3 className="text-[15px] font-semibold text-navy mb-1">Certification Programs</h3>
                <p className="text-xs text-muted-foreground">Professional certifications for trade specialists</p>
              </Link>
              <Link
                href="/research"
                className="bg-card border border-border rounded-lg p-8 text-center hover:border-gold/50 hover:-translate-y-1 transition-all"
              >
                <div className="text-4xl mb-3">🔬</div>
                <h3 className="text-[15px] font-semibold text-navy mb-1">Research Publications</h3>
                <p className="text-xs text-muted-foreground">Access our latest trade research and publications</p>
              </Link>
              <Link
                href="/alumni"
                className="bg-card border border-border rounded-lg p-8 text-center hover:border-gold/50 hover:-translate-y-1 transition-all"
              >
                <div className="text-4xl mb-3">🌐</div>
                <h3 className="text-[15px] font-semibold text-navy mb-1">Alumni Network</h3>
                <p className="text-xs text-muted-foreground">Connect with certified trade professionals worldwide</p>
              </Link>
            </div>
          </div>
        </section>

        {/* About IITrade */}
        <section className="py-16 bg-card">
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

        {/* Co-Founders */}
        <section className="py-16 bg-background">
          <div className="max-w-[1180px] mx-auto px-8">
            <SectionHeader
              eyebrow="Leadership"
              title="Meet Our Co-Founders"
              subtitle="The founding team behind the Institute of International Trade."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
              {coFounders.map((founder) => (
                <div
                  key={founder.name}
                  className="bg-card border border-border rounded-lg p-8 text-center hover:border-gold/50 transition-colors"
                >
                  {founder.photo ? (
                    <Image
                      src={founder.photo}
                      alt={founder.name}
                      width={112}
                      height={112}
                      className="w-14 h-14 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <Avatar initials={founderInitials(founder.name)} size="md" className="mx-auto" />
                  )}
                  <h3 className="text-[15px] font-semibold text-navy mt-4 mb-1">{founder.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{founder.title}</p>
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gold text-xs font-semibold hover:underline"
                  >
                    LinkedIn Profile →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs & Certifications */}
        <section className="py-16 bg-background">
          <div className="max-w-[1180px] mx-auto px-8">
            <SectionHeader eyebrow="Education" title="Professional Certifications" />
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
            <div className="text-center mt-12">
              <Link
                href="/programs"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-nav hover:bg-primary/90 transition-opacity"
              >
                View All Programs
              </Link>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-16 bg-card">
          <div className="max-w-[1180px] mx-auto px-8">
            <SectionHeader
              eyebrow="Events"
              title="Upcoming Events"
              subtitle="Join our conferences, seminars, and webinars to stay ahead in global trade."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <EventCard
                tag="Conference"
                title="Global Trade Summit 2025"
                description="Industry leaders discuss the future of global trade and digitalization."
                date="June 20, 2025"
                location="Dhaka, Bangladesh"
                rsvpHref="/events"
              />
              <EventCard
                tag="Webinar"
                title="Trade Finance Masterclass"
                description="A deep-dive webinar on innovative trade finance applications."
                date="May 15, 2025"
                location="Online"
                rsvpHref="/events"
              />
              <EventCard
                tag="Seminar"
                title="Sustainable Trade Forum"
                description="Exploring sustainable trade practices and ESG compliance."
                date="July 5, 2025"
                location="Dhaka, Bangladesh"
                rsvpHref="/events"
              />
            </div>
          </div>
        </section>

        {/* Alumni Network — dark section */}
        <section className="py-16 bg-navy text-white">
          <div className="max-w-[1180px] mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16">
              <div className="max-w-2xl">
                <Eyebrow variant="light">Community</Eyebrow>
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
              <StoryCard
                initials="SK"
                name="Sarah Khan"
                role="Senior Trade Manager"
                quote="The CDCS certification fundamentally elevated my technical understanding of complex credit structures, directly contributing to my recent promotion and allowing me to serve our multinational clients with greater authority."
                className="bg-[#2b3040] border-white/10"
              />
              <StoryCard
                initials="DC"
                name="David Chen"
                role="Trade Analyst"
                quote="Connecting with the IITrade alumni network has been invaluable. The exchange of practical insights regarding emerging market regulations has given our team a significant competitive edge."
                className="bg-[#2b3040] border-white/10"
              />
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
                href="/alumni/apply"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-nav hover:bg-primary/90 transition-opacity"
              >
                Get Started Free
              </Link>
              <Link
                href="/programs"
                className="bg-transparent border border-white/60 text-white px-6 py-3 rounded-lg text-nav hover:bg-white/10 transition-colors"
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </section>

        {/* Contact & Company Info */}
        <section className="py-16 bg-card">
          <div className="max-w-[1180px] mx-auto px-8">
            <SectionHeader
              eyebrow="Get in Touch"
              title="Contact & Company Info"
              subtitle="Reach out to the Institute of International Trade."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden>📍</span>
                  <div>
                    <div className="text-[13px] font-semibold text-navy mb-0.5">Address</div>
                    <div className="text-sm text-muted-foreground">11/1 Indira Road, Dhaka, Bangladesh</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden>📞</span>
                  <div>
                    <div className="text-[13px] font-semibold text-navy mb-0.5">Phone</div>
                    <a href="tel:01841994705" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                      01841994705
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden>🕘</span>
                  <div>
                    <div className="text-[13px] font-semibold text-navy mb-0.5">Hours</div>
                    <div className="text-sm text-muted-foreground">Mon–Fri, 10am – 6pm</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl" aria-hidden>✉️</span>
                  <div>
                    <div className="text-[13px] font-semibold text-navy mb-0.5">Email</div>
                    <a href="mailto:iitrade.org@gmail.com" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                      iitrade.org@gmail.com
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-navy mb-3">Follow Us</div>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 border border-border rounded-lg px-4 py-2.5 text-sm font-semibold text-navy hover:border-gold hover:text-gold transition-colors"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
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
              By subscribing, you agree to our Privacy Policy and consent to receive updates from IITrade.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
