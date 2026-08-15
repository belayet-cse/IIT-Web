import { cn } from "@/lib/utils"

interface AdminShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AdminShell({ sidebar, children, className }: AdminShellProps) {
  return (
    <div className={cn("flex min-h-screen", className)}>
      {sidebar}
      <div className="flex-1 flex flex-col bg-background">
        {children}
      </div>
    </div>
  )
}
