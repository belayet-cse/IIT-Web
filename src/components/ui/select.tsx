import { cn } from "@/lib/utils"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full font-sans text-sm border border-border rounded-sm px-[14px] py-[11px]",
        "text-foreground bg-card",
        "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
