import Link from "next/link"
import { cn } from "@/lib/utils"

interface HeroIconButtonProps {
  href: string
  label: string
  icon: React.ReactNode
  /** Small red pill above the button, e.g. "5 new". Hidden when empty. */
  badge?: string
  className?: string
}

export function HeroIconButton({ href, label, icon, badge, className }: HeroIconButtonProps) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        "group relative flex flex-col items-center gap-1 rounded-[10px] px-[14px] py-2",
        "bg-white/[0.06] border border-gold/35 transition-all duration-200",
        "hover:bg-gold/15 hover:border-gold hover:-translate-y-0.5",
        className
      )}
    >
      {badge && (
        <span className="absolute -top-2.5 left-1/2 ml-3 rounded-lg bg-[#e0475a] px-[5px] py-px text-[9px] font-bold text-white whitespace-nowrap">
          {badge}
        </span>
      )}
      <span className="text-gold [&_svg]:h-[22px] [&_svg]:w-[22px]">{icon}</span>
      <span className="text-[10.5px] font-semibold tracking-[0.3px] text-[#e8e9f0] whitespace-nowrap uppercase">
        {label}
      </span>
    </Link>
  )
}
