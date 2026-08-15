import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { Clock, Mail, MapPin, Phone } from "lucide-react"

interface FooterProps {
  className?: string
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Blogs", href: "/blog" },
  { label: "Events", href: "/events" },
  { label: "Resources", href: "/research" },
  { label: "Alumni", href: "/alumni" },
]

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("bg-[#0a3066] text-white pt-16 pb-8", className)}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center bg-white p-3 rounded-md mb-6">
              <Image
                src="/iit-logo.png"
                alt="Institute of International Trade"
                width={140}
                height={50}
                style={{ objectFit: "contain", height: 32, width: "auto" }}
              />
            </Link>
            <p className="text-sm text-white/60 mb-6 leading-relaxed">
              Advancing international trade expertise through education, research, and industry collaboration.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/company/institute-of-international-trade-iit/about/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61577748026721"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://www.youtube.com/channel/UCAe6sZU944oeLVGQ2bOsehg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <YouTubeIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="flex items-center text-sm text-white/60 hover:text-white transition-colors">
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full mr-2" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-sm text-white/60">
                <MapPin className="h-4 w-4 mt-0.5 mr-3 text-[#f59e0b] flex-shrink-0" />
                <span>Dhaka</span>
              </li>
              <li className="flex items-center text-sm text-white/60">
                <Phone className="h-4 w-4 mr-3 text-[#f59e0b] flex-shrink-0" />
                <a href="tel:+8801841994705" className="hover:text-white transition-colors">01841994705</a>
              </li>
              <li className="flex items-center text-sm text-white/60">
                <Mail className="h-4 w-4 mr-3 text-[#f59e0b] flex-shrink-0" />
                <a href="mailto:iitrade.org@gmail.com" className="hover:text-white transition-colors">iitrade.org@gmail.com</a>
              </li>
              <li className="flex items-start text-sm text-white/60">
                <Clock className="h-4 w-4 mt-0.5 mr-3 text-[#f59e0b] flex-shrink-0" />
                <span>Mon-Fri 10 am - 6 pm</span>
              </li>
            </ul>
          </div>

          {/* Accreditations */}
          <div>
            <h3 className="text-lg font-bold mb-6">Accreditations</h3>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Excellence in International Trade Solution &amp; Innovation. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
