import { forwardRef } from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full font-sans text-sm border border-border rounded-sm px-[14px] py-[11px]",
        "text-foreground bg-card placeholder:text-muted-foreground resize-y",
        "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
})
