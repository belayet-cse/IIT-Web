import Link from "next/link"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { SectionHeader } from "@/components/shared/section-header"
import { EventsTabs } from "@/components/events/events-tabs"
import { FeaturedEventSection } from "@/components/events/featured-event"

const whyAttend = [
  {
    icon: "🤝",
    title: "Network with Experts",
    description: "Connect with industry leaders, practitioners, and peers to build valuable professional relationships.",
  },
  {
    icon: "💡",
    title: "Gain Insights",
    description: "Learn about the latest trends, challenges, and opportunities in international trade from leading experts.",
  },
  {
    icon: "📈",
    title: "Professional Development",
    description: "Enhance your skills and knowledge through interactive workshops, case studies, and practical sessions.",
  },
  {
    icon: "🌍",
    title: "Global Perspective",
    description: "Gain a broader understanding of international trade from diverse speakers and participants from around the world.",
  },
]

const faqs = [
  {
    q: "How do I register for an event?",
    a: "Event registration can be completed through our website. Navigate to the specific event page and click on the 'Register' button. Follow the prompts to complete your registration and payment (if applicable).",
  },
  {
    q: "What is your cancellation policy?",
    a: "For paid events, cancellations made at least 14 days before the event start date will receive a full refund. Cancellations made 7-13 days before will receive a 50% refund. No refunds will be issued for cancellations less than 7 days before the event. You may transfer your registration to another person at no additional cost.",
  },
  {
    q: "Are virtual attendance options available?",
    a: "Yes, many of our events offer virtual attendance options. Events with virtual options will be clearly marked on the event page. Virtual attendees receive access to livestreams, interactive sessions, and digital materials.",
  },
  {
    q: "How can I access recordings of past events?",
    a: "Recordings of past events are available to registered attendees through our learning portal. Some recordings may also be available for purchase separately. Check the specific event page for details on recording availability.",
  },
  {
    q: "Do you offer discounts for students or group registrations?",
    a: "Yes, we offer discounted rates for full-time students (with valid ID), IIT alumni, and group registrations of 3 or more people from the same organization. Contact us for more information on special rates.",
  },
]

export default function EventsPage() {
  return (
    <>
      <TopNav />
      <main className="pt-20">
        {/* Header */}
        <section className="py-16 bg-background">
          <div className="max-w-[760px] mx-auto px-6 text-center">
            <h1 className="font-heading text-[34px] text-navy mb-4">Events & Conferences</h1>
            <p className="text-base text-muted-foreground">
              Connect with industry leaders, expand your knowledge, and stay at the forefront of international
              trade.
            </p>
          </div>
        </section>

        {/* Featured Event */}
        <FeaturedEventSection />

        {/* Upcoming / Past Events */}
        <section className="py-16 bg-background">
          <div className="max-w-[1180px] mx-auto px-8">
            <EventsTabs />
          </div>
        </section>

        {/* Why Attend */}
        <section className="py-16 bg-card">
          <div className="max-w-[1180px] mx-auto px-8">
            <SectionHeader
              eyebrow="Why Attend"
              title="Why Attend Our Events"
              subtitle="Discover the value and benefits of participating in IIT's events and conferences."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[18px]">
              {whyAttend.map((item) => (
                <div key={item.title} className="bg-background border border-border rounded-xl p-6 text-center">
                  <div className="text-3xl mb-3" aria-hidden>
                    {item.icon}
                  </div>
                  <h3 className="text-[14px] font-semibold text-navy mb-1.5">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-background">
          <div className="max-w-[760px] mx-auto px-6">
            <SectionHeader
              eyebrow="Event FAQs"
              title="Frequently Asked Questions"
              subtitle="Answers to commonly asked questions about our events."
            />
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.q} className="bg-card border border-border rounded-xl px-5 py-4 group">
                  <summary className="text-[14px] font-semibold text-navy cursor-pointer list-none flex items-center justify-between gap-3">
                    {faq.q}
                    <span className="text-gold group-open:rotate-45 transition-transform" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="text-sm text-muted-foreground mt-3">{faq.a}</p>
                </details>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">
              Have additional questions about our events?{" "}
              <Link href="/contact?subject=Event%20Inquiry" className="text-gold font-semibold hover:underline">
                Contact Our Events Team
              </Link>
            </p>
          </div>
        </section>

        {/* Host Your Event */}
        <section
          className="py-20 text-center text-white"
          style={{ background: "linear-gradient(135deg, var(--navy-surface), var(--navy))" }}
        >
          <div className="max-w-[640px] mx-auto px-6">
            <h2 className="font-heading text-[30px] text-white mb-4">Host Your Event with IIT</h2>
            <p className="text-base text-white/75 mb-8">
              Looking for a venue for your trade-related event? IIT offers state-of-the-art facilities and
              support services for conferences, workshops, and seminars.
            </p>
            <Link
              href="/contact?subject=Event%20Hosting"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-sm text-nav hover:bg-primary/90 transition-opacity"
            >
              Inquire About Hosting
            </Link>
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
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-sm text-nav hover:bg-primary/90 transition-opacity whitespace-nowrap"
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
