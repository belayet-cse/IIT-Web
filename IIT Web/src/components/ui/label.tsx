import { cn } from "@/lib/utils"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({ required, children, className, ...props }: LabelProps) {
  return (
    <label className={cn("block text-[13px] font-semibold text-navy mb-[7px]", className)} {...props}>
      {children}
      {required && <span className="text-red-600 ml-1">*</span>}
    </label>
  )
}
