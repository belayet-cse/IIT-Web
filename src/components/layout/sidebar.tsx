"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface NavGroup {
  label: string
  items: NavItem[]
}

interface SidebarProps {
  navGroups: NavGroup[]
  activeItem?: string
  onItemClick?: (item: string) => void
  className?: string
}

export function Sidebar({ navGroups, activeItem, onItemClick, className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn("w-[240px] bg-navy text-white flex-shrink-0 flex flex-col py-[22px]", className)}>
      <div className="px-[22px] pb-[22px] mb-4 border-b border-white/[0.08]">
        <div className="font-heading font-bold text-[17px]">IITrade Admin</div>
        <div className="text-section-label text-white/50 mt-[2px]">Management Console</div>
      </div>

      {navGroups.map((group) => (
        <div key={group.label}>
          <div className="text-section-label text-white/50 px-[22px] pt-[14px] pb-2">
            {group.label}
          </div>
          {group.items.map((item) => {
            const isActive = item.href ? pathname.startsWith(item.href) : item.label === activeItem
            const itemClassName = cn(
              "flex items-center gap-[10px] px-[22px] py-[10px] text-nav text-white/80",
              "border-l-[3px] border-transparent cursor-pointer transition-colors",
              isActive && "nav-active text-gold font-semibold"
            )

            if (item.href) {
              return (
                <Link key={item.label} href={item.href} className={itemClassName}>
                  {item.icon}
                  {item.label}
                </Link>
              )
            }

            return (
              <div key={item.label} onClick={() => onItemClick?.(item.label)} className={itemClassName}>
                {item.icon}
                {item.label}
              </div>
            )
          })}
        </div>
      ))}
    </aside>
  )
}
