"use client"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
  count?: number
}

interface AdminTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export function AdminTabs({ tabs, activeTab, onTabChange, className }: AdminTabsProps) {
  return (
    <div className={cn("flex gap-1 mb-[22px] border-b border-border", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-[7px] px-[18px] py-[11px] text-nav font-semibold cursor-pointer",
              "border-b-2 border-transparent transition-colors",
              isActive ? "text-navy" : "text-muted-foreground hover:text-foreground"
            )}
            style={isActive ? { borderBottomColor: "var(--gold)" } : undefined}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "text-[11px] px-[7px] py-px rounded-full font-bold"
                )}
                style={
                  isActive
                    ? { backgroundColor: "var(--warning-bg)", color: "var(--warning-text)" }
                    : undefined
                }
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
