"use client"
import { cn } from "@/lib/utils"
import { useRef } from "react"

interface UploadBoxProps {
  hint?: string
  onChange?: (file: File) => void
  className?: string
}

export function UploadBox({ hint = "PDF, JPG, PNG (max 5MB)", onChange, className }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onChange?.(file)
  }

  return (
    <div
      className={cn(
        "border-[1.5px] border-dashed border-border rounded-xl p-6 text-center",
        "text-muted-foreground text-[13px] cursor-pointer hover:border-ring transition-colors",
        className
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
      📎 <strong className="text-navy">Choose file</strong> or drag it here — {hint}
    </div>
  )
}
