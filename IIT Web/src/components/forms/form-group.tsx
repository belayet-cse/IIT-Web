import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface FormGroupProps {
  label?: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}

export function FormGroup({ label, required, hint, children, className }: FormGroupProps) {
  return (
    <div className={cn("mb-[22px]", className)}>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {hint && <p className="text-[11.5px] text-muted-foreground mt-[5px]">{hint}</p>}
    </div>
  )
}
