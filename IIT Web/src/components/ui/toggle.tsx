"use client"
import { cn } from "@/lib/utils"

interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Toggle({ checked = false, onChange, disabled, className }: ToggleProps) {
  return (
    <label className={cn("relative inline-block w-9 h-5 cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className)}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span
        className="absolute inset-0 rounded-full transition-colors duration-200"
        style={{ backgroundColor: checked ? "var(--gold)" : "#d8dae0" }}
      />
      <span
        className="absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform duration-200"
        style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}
      />
    </label>
  )
}
