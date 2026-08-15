import Link from "next/link"
import { ArrowRight, BookOpen, Circle, Clock, Eye, GraduationCap, HelpCircle, MessageSquare, Rss } from "lucide-react"
import { cn } from "@/lib/utils"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { HeroSlider } from "@/components/shared/hero-slider"
import { Button, buttonVariants } from "@/components/ui/button"

const slides = [
  {
    title: "Research Excellence in Global Trade",
    subtitle: "Access cutting-edge industry insights, publications, and research from leading trade experts.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80",
    btn1: { label: "View Publications", href: "/research" },
    btn2: { label: "Join Our Network", href: "/alumni/apply" },
  },
  {
    title: "Connect with Industry Leaders",
    subtitle: "Network with global trade professionals, attend conferences, and expand your professional horizons.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=80",
    btn1: { label: "Upcoming Events", href: "/events" },
    btn2: { label: "Become a Member", href: "/alumni/apply" },
  },
  {
    title: "Globally Recognized Trade Certifications",
    subtitle: "CDCS and CSDG, among other internationally recognized credentials to advance your trade finance career.",
    image: "https://images.unsplash.com/photo-1579389083395-4507e98b5e67?w=1600&q=80",
    btn1: { label: "View Programs", href: "/programs" },
    btn2: { label: "Get Started", href: "/alumni/apply" },
  },
]

type Blog = {
  id: number
  category: string
  articleNo: string
  issueNo: string
  issueTitle: string
  title: string
  excerpt: string
  views: number
  comments: number
  readMins: number
  thumbClass: string
}

const BLOGS: Blog[] = [
  { id: 1, category: "UCP 600", articleNo: "01", issueNo: "04", issueTitle: `"The Rational and Practical Meaning of 'Express Indication'"`, title: "The rational and practical meanin...", excerpt: "Why Express Indication is mandatory? What does it mean to the business", views: 173, comments: 0, readMins: 5, thumbClass: "bg-[#f0f4ff] text-[#0a3066]" },
  { id: 2, category: "UCP 600", articleNo: "01", issueNo: "01", issueTitle: `"Any Documentary Credits"`, title: `"Any Documentary Credits" - Meani...`, excerpt: "Commercial Letters of Credit, Standby Letters of Credit, and Demand...", views: 116, comments: 1, readMins: 3, thumbClass: "bg-teal-50 text-teal-800" },
  { id: 3, category: "UCP 600", articleNo: "01", issueNo: "05", issueTitle: `"They are Binding on All Parties Thereto"`, title: `"They are binding on all parties...`, excerpt: `"When the text of the credit expressly indicates that it is subject to these...`, views: 58, comments: 0, readMins: 3, thumbClass: "bg-[#f0f4ff] text-[#0a3066]" },
  { id: 4, category: "UCP 600", articleNo: "02", issueNo: "03", issueTitle: "Decoding the Definition of the Advising Bank", title: `Decoding the definition of the "A...`, excerpt: "Theoretically speaking, a documentary credit transaction can be executed...", views: 56, comments: 0, readMins: 2, thumbClass: "bg-[#fef08a] text-[#0a3066]" },
  { id: 5, category: "UCP 600", articleNo: "01", issueNo: "09", issueTitle: `On "Collection Basis"`, title: `Documents forward on "Collection ...`, excerpt: "The beneficiary made a presentation to a nominated bank within the expiry...", views: 43, comments: 0, readMins: 3, thumbClass: "bg-indigo-50 text-indigo-900" },
  { id: 6, category: "UCP 600", articleNo: "01", issueNo: "08", issueTitle: `"UCP are Rules"`, title: `The meaning of "UCP are Rules"`, excerpt: "While practitioners have often considered the UCP (Uniform...", views: 43, comments: 0, readMins: 2, thumbClass: "bg-blue-50 text-blue-900" },
  { id: 7, category: "UCP 600", articleNo: "02 (Applicant)", issueNo: "05", issueTitle: `Decoding the definition of the "Applicant"`, title: `Decoding the definition of the "A...`, excerpt: `UCP 600, Article 2 defines the term "Applicant" means the party on whose...`, views: 35, comments: 0, readMins: 3, thumbClass: "bg-[#fef08a] text-[#0a3066]" },
  { id: 8, category: "UCP 600", articleNo: "01", issueNo: "03", issueTitle: "Compatibility of Standby LC Under UCP 600", title: `The meaning of "to the extent to ...`, excerpt: "Standby Letters of Credit Under UCP 600...", views: 32, comments: 0, readMins: 2, thumbClass: "bg-[#f0f4ff] text-[#0a3066]" },
]

export default function HomePage() {
  return (
    <>
      <TopNav />
      <main>
        <HeroSlider slides={slides} />

        {/* Welcome */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Welcome to the Institute of International Trade (IITrade)
            </h2>
            <p className="text-gray-600 mb-12 text-lg">
              Established in 2025, IITrade is your gateway to mastering the dynamic world of international
              trade. We are dedicated to empowering students, professionals, and organizations with
              cutting-edge knowledge and skills to thrive in global markets.
            </p>
            <div className="bg-gray-50 rounded-xl p-8 text-left shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Why Choose IITrade?</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Circle className="h-2 w-2 mt-2 mr-3 fill-[#0a3066] text-[#0a3066] flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Expert Faculty:</strong> Learn from distinguished academics and industry leaders.
                  </p>
                </li>
                <li className="flex items-start">
                  <Circle className="h-2 w-2 mt-2 mr-3 fill-[#0a3066] text-[#0a3066] flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Comprehensive Programs:</strong> From CDCS and CSDG to Trade research, our courses and training are designed to meet industry demands.
                  </p>
                </li>
                <li className="flex items-start">
                  <Circle className="h-2 w-2 mt-2 mr-3 fill-[#0a3066] text-[#0a3066] flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Global Perspective:</strong> Gain insights into international trade, intellectual property, and market trends.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Quick Access */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Access</h2>
              <p className="text-gray-600">Popular resources and services</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/blog" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
                <div className="w-16 h-16 mx-auto bg-pink-500 rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <Rss className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Blogs</h3>
                <p className="text-gray-600 text-sm">Discover our best quality blogs and insights</p>
              </Link>
              <Link href="/programs" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
                <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Certification Programs</h3>
                <p className="text-gray-600 text-sm">Professional certifications for trade specialists</p>
              </Link>
              <Link href="/research" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
                <div className="w-16 h-16 mx-auto bg-yellow-500 rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Research Publications</h3>
                <p className="text-gray-600 text-sm">Access our latest trade research and publications</p>
              </Link>
              <Link href="/qa" className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow group">
                <div className="w-16 h-16 mx-auto bg-gray-800 rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Trade Inquiries</h3>
                <p className="text-gray-600 text-sm">Submit questions or request personalized assistance</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Blogs */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Blogs</h2>
              <p className="text-gray-600">
                Discover our industry-recognized courses and certifications designed to elevate your international trade expertise.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {BLOGS.map((b) => (
                <article key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                  <div className={cn("p-6 text-center flex-shrink-0 aspect-[4/3] flex flex-col items-center justify-center border-b border-gray-100 relative", b.thumbClass)}>
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#0a3066] rounded text-white flex items-center justify-center text-[10px] font-bold">iit</div>
                      <div className="text-left leading-none">
                        <span className="text-[8px] block font-bold uppercase">Institute of</span>
                        <span className="text-[8px] block font-bold uppercase">International Trade</span>
                      </div>
                    </div>
                    <h4 className="text-2xl font-bold mb-2 mt-4">{b.category}</h4>
                    <p className="text-xs text-gray-700">Article: {b.articleNo}<br />Issue No: {b.issueNo}</p>
                    <p className="text-xs text-gray-700 mt-2 italic px-4">Issue Title: {b.issueTitle}</p>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold">Free</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {b.views}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {b.comments}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">{b.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{b.excerpt}</p>
                    <div className="flex justify-between items-center text-xs font-medium border-t border-gray-100 pt-3 mt-auto">
                      <span className="text-gray-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {b.readMins} min read</span>
                      <Link href="/blog" className="text-[#0a3066] hover:underline flex items-center gap-1">
                        Read article <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center">
              <Link href="/blog" className={buttonVariants({ variant: "secondary", size: "xl" })}>
                View All Blogs
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="py-24 relative text-center text-white"
          style={{
            backgroundImage: "linear-gradient(rgba(10,48,102,0.85), rgba(10,48,102,0.85)), url('https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Advance Your Career in International Trade?</h2>
            <p className="text-lg mb-10 text-gray-200">
              Join thousands of professionals who have transformed their careers through our specialized programs and industry-recognized certifications.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/programs" className={buttonVariants({ variant: "default", size: "xl" })}>
                Browse Programs
              </Link>
              <Link href="/qa" className={buttonVariants({ variant: "inverse", size: "xl" })}>
                Request Information
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay Informed</h2>
            <p className="text-gray-600 mb-8">Subscribe to our newsletter for the latest insights, research, and industry updates.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                required
                className="flex-grow rounded-md border border-gray-300 shadow-sm px-4 py-2.5 text-sm outline-none focus:border-[#0a3066] focus:ring-1 focus:ring-[#0a3066]"
              />
              <Button type="submit" variant="secondary" size="xl">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from IIT.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
