import { cn } from "@/lib/utils"

interface Stat {
  value: string
  label: string
}

interface StatBarProps {
  stats: Stat[]
  className?: string
}

export function StatBar({ stats, className }: StatBarProps) {
  return (
    <div className={cn("bg-navy-surface border-y border-white/[0.08]", className)}>
      <div className="max-w-[1180px] mx-auto grid" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className="text-center py-[26px] px-3 border-r border-white/[0.08] last:border-r-0"
          >
            <div className="font-heading text-[30px] text-gold font-bold">{stat.value}</div>
            <div className="text-section-label mt-1" style={{ color: "#9ba1bd" }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
