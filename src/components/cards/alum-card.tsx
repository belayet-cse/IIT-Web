import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ContactInfo {
  email?: string
  phone?: string
}

interface AlumCardProps {
  initials: string
  avatarColor?: string
  name: string
  role: string
  org: string
  badgeVariant?: "verified" | "honorary"
  badgeLabel?: string
  contact?: ContactInfo
  className?: string
}

export function AlumCard({
  initials,
  avatarColor,
  name,
  role,
  org,
  badgeVariant = "verified",
  badgeLabel,
  contact,
  className,
}: AlumCardProps) {
  const defaultLabel = badgeVariant === "verified" ? "Verified Alumni" : "Honorary Member"
  return (
    <div className={cn("bg-card border border-border rounded-xl p-[22px] text-center", className)}>
      <Avatar initials={initials} color={avatarColor} className="mx-auto mb-3" />
      {badgeLabel !== null && (
        <Badge variant={badgeVariant} className="mb-[10px]">
          {badgeLabel ?? defaultLabel}
        </Badge>
      )}
      <div className="text-sm font-bold text-navy mb-[2px]">{name}</div>
      <div className="text-xs text-muted-foreground mb-[2px]">{role}</div>
      <div className="text-xs text-muted-foreground mb-[10px]">{org}</div>
      {contact && (
        <div className="border-t border-border mt-3 pt-3 flex flex-col gap-[6px] text-xs text-muted-foreground">
          {contact.email && (
            <span className="flex items-center justify-center gap-[6px]">✉ {contact.email}</span>
          )}
          {contact.phone && (
            <span className="flex items-center justify-center gap-[6px]">📞 {contact.phone}</span>
          )}
        </div>
      )}
    </div>
  )
}
