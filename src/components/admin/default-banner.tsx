import { cn } from "@/lib/utils"

interface DefaultBannerProps {
  title: string
  description: string
  actions: React.ReactNode
  className?: string
}

export function DefaultBanner({ title, description, actions, className }: DefaultBannerProps) {
  return (
    <div className={cn("bg-navy text-white rounded-xl p-[18px_22px] mb-5 flex justify-between items-center gap-5", className)}>
      <div>
        <div className="text-sm font-bold text-white mb-[3px]">{title}</div>
        <div className="text-[12.5px] text-white/70">{description}</div>
      </div>
      <div className="flex items-center gap-5 flex-shrink-0">{actions}</div>
    </div>
  )
}
