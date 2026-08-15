import { cn } from "@/lib/utils"

interface LockedOverlayProps {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}

export function LockedOverlay({ title, description, children, className }: LockedOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      <div style={{ filter: "blur(4px)", opacity: 0.55, pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center flex-col gap-[14px] text-center">
        <div className="w-[46px] h-[46px] rounded-full bg-navy flex items-center justify-center text-[18px]">
          🔒
        </div>
        <h4 className="text-base font-bold text-navy font-sans">{title}</h4>
        <p className="text-[13px] text-muted-foreground max-w-[320px]">{description}</p>
      </div>
    </div>
  )
}
