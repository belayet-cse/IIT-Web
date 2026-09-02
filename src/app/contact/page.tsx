import { Suspense } from "react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { SectionHeader } from "@/components/shared/section-header"
import { ContactForm } from "@/components/contact/contact-form"

const contactInfo = [
  { icon: "📍", label: "Main Campus", value: "11/1 Indira Road, Dhaka, Bangladesh" },
  { icon: "📞", label: "Phone", value: "01841994705", href: "tel:01841994705" },
  { icon: "✉️", label: "Email", value: "iitrade.org@gmail.com", href: "mailto:iitrade.org@gmail.com" },
  { icon: "🕘", label: "Office Hours", value: "Mon–Fri, 10am – 6pm · Closed weekends & public holidays" },
]

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/institute-of-international-trade-iit/about/" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61577748026721" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCAe6sZU944oeLVGQ2bOsehg" },
]

const faqs = [
  {
    q: "How quickly will I receive a response to my inquiry?",
    a: "We strive to respond to all inquiries within 1-2 business days. For urgent matters, please call our office directly.",
  },
  {
    q: "Can I schedule a campus visit?",
    a: "Yes, we welcome campus visits. Please fill out the contact form and select a subject related to your visit.",
  },
  {
    q: "How do I apply for a program?",
    a: "Program applications can be submitted through our website. Visit the specific program page and click on the 'Apply Now' button.",
  },
  {
    q: "Do you offer virtual consultations?",
    a: "Yes, we offer virtual consultations for international students and professionals. Please indicate your preference for a virtual meeting in your inquiry.",
  },
]

export default function ContactPage() {
  return (
    <>
      <TopNav />
      <main className="pt-20">
        {/* Header */}
        <section className="py-16 bg-background">
          <div className="max-w-[760px] mx-auto px-6 text-center">
            <h1 className="font-heading text-[34px] text-navy mb-4">Contact Us</h1>
            <p className="text-base text-muted-foreground">
              We&apos;re here to help with any questions you might have about our programs, events, or resources.
            </p>
          </div>
        </section>

        {/* Contact Info + Form */}
        <section className="py-16 bg-card">
          <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10">
            <div>
              <div className="bg-background border border-border rounded-xl p-8 mb-6">
                <h2 className="font-heading text-[19px] text-navy mb-5">Contact Information</h2>
                <ul className="space-y-5">
                  {contactInfo.map((item) => (
                    <li key={item.label} className="flex items-start gap-3">
                      <span className="text-xl" aria-hidden>
                        {item.icon}
                      </span>
                      <div>
                        <div className="text-[13px] font-semibold text-navy mb-0.5">{item.label}</div>
                        {item.href ? (
                          <a href={item.href} className="text-sm text-muted-foreground hover:text-gold transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <div className="text-sm text-muted-foreground">{item.value}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-background border border-border rounded-xl p-8">
                <h2 className="font-heading text-[16px] text-navy mb-4">Connect With Us</h2>
                <div className="flex flex-wrap gap-2.5">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 border border-border rounded-sm px-3.5 py-2 text-[12.5px] font-semibold text-navy hover:border-gold hover:text-gold transition-colors"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <Suspense fallback={<div className="bg-background border border-border rounded-2xl p-10 text-sm text-muted-foreground">Loading…</div>}>
              <ContactForm />
            </Suspense>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-background">
          <div className="max-w-[760px] mx-auto px-6">
            <SectionHeader
              eyebrow="Contact FAQs"
              title="Frequently Asked Questions"
              subtitle="Find quick answers to common questions about contacting us."
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
