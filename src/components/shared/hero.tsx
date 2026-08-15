import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/shared/eyebrow"

interface HeroProps {
  eyebrow?: string
  title: string
  subtitle?: string
  className?: string
  children?: React.ReactNode
}

export function Hero({ eyebrow, title, subtitle, className, children }: HeroProps) {
  return (
    <section
      className={cn("relative overflow-hidden text-white text-center py-[72px] pb-[48px]", className)}
      style={{
        background:
          "linear-gradient(160deg, rgba(10,48,102,.94), rgba(10,48,102,.86)), radial-gradient(circle at 80% 20%, rgba(245,158,11,.18), transparent 55%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 64px)",
        }}
      />
      <div className="relative z-10 max-w-[1180px] mx-auto px-6">
        {eyebrow && <Eyebrow variant="light">{eyebrow}</Eyebrow>}
        <h1 className="font-heading text-[44px] font-bold text-white mb-[14px]">{title}</h1>
        {subtitle && (
          <p className="max-w-[560px] mx-auto text-[16px]" style={{ color: "#c7cbe0" }}>
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}
