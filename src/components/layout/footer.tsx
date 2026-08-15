import { cn } from "@/lib/utils"
import Link from "next/link"

interface FooterLink {
  label: string
  href: string
}

interface FooterProps {
  className?: string
}

const footerLinks: FooterLink[][] = [
  [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  [
    { label: "Accreditation", href: "/accreditation" },
    { label: "Contact Us", href: "/contact" },
  ],
  [
    { label: "Careers", href: "/careers" },
  ],
]

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("bg-navy w-full py-16 px-8 border-t border-navy-surface", className)}>
      <div className="max-w-[1180px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div>
          <Link href="/" className="font-heading text-xl text-gold block mb-6">
            IITrade
          </Link>
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Institute of International Trade. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
          {footerLinks.map((group, i) => (
            <div key={i} className="flex flex-col gap-3">
              {group.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/60 hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}
