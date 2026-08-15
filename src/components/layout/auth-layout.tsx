import Link from "next/link"
import { cn } from "@/lib/utils"

interface AuthLayoutProps {
  leftContent: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AuthLayout({ leftContent, children, className }: AuthLayoutProps) {
  return (
    <div className={cn("min-h-screen flex", className)}>

      {/* ── Left navy panel ── */}
      <div className="hidden lg:flex flex-col w-[42%] bg-navy relative overflow-hidden flex-shrink-0">
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 72px), repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 72px)",
          }}
        />
        {/* Gold glow blob */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,.10) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,.06) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Brand */}
          <Link href="/" className="group flex items-end gap-2.5 w-fit">
            <span className="font-heading text-[26px] text-gold font-bold leading-none">IIT</span>
            <span className="text-[10px] text-white/40 uppercase tracking-[0.14em] leading-none mb-[3px] font-sans">
              Institute of International Trade
            </span>
          </Link>

          {/* Main content slot */}
          <div className="flex-1 flex items-center py-12">
            {leftContent}
          </div>

          {/* Bottom stats strip */}
          <div className="border-t border-white/[0.08] pt-6">
            <div className="flex items-center gap-8">
              {[
                { value: "278", label: "Verified Alumni" },
                { value: "45+", label: "Countries" },
                { value: "5000+", label: "Certified" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-heading text-[22px] text-gold font-bold leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.08em] mt-1 font-sans">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="font-heading text-2xl text-gold font-bold">
              IIT
            </Link>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-0.5">
              Institute of International Trade
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
