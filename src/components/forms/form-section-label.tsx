import { cn } from "@/lib/utils"

interface FormSectionLabelProps {
  children: React.ReactNode
  className?: string
}

export function FormSectionLabel({ children, className }: FormSectionLabelProps) {
  return (
    <div
      className={cn(
        "text-section-label text-gold font-bold mt-[34px] mb-[18px] pb-[10px] border-b border-border first:mt-0",
        className
      )}
    >
      {children}
    </div>
  )
}
