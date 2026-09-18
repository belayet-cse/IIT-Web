import Link from "next/link"
import { Megaphone } from "lucide-react"

export interface Notice {
  text: string
  href: string
}

interface NoticeTickerProps {
  notices: Notice[]
  label?: string
}

export function NoticeTicker({ notices, label = "Notices" }: NoticeTickerProps) {
  if (notices.length === 0) return null

  // The list is rendered twice so the track can loop seamlessly by
  // translating exactly -50%; the copy is hidden from assistive tech.
  const loop = [...notices, ...notices]
  const seconds = Math.max(24, notices.length * 8)

  return (
    <div
      className="group flex items-stretch overflow-hidden bg-gold text-navy text-[13.5px] font-semibold"
      role="region"
      aria-label={label}
    >
      <div className="flex flex-shrink-0 items-center gap-1.5 bg-navy px-[18px] py-[9px] text-[11.5px] tracking-[1px] text-gold uppercase">
        <Megaphone className="h-3.5 w-3.5" aria-hidden />
        {label}
      </div>
      <div className="min-w-0 flex-1 overflow-hidden motion-reduce:overflow-x-auto">
        <div
          className="animate-ticker flex w-max py-[9px] motion-reduce:animate-none group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${seconds}s` }}
        >
          {loop.map((notice, i) => (
            <Link
              key={i}
              href={notice.href}
              aria-hidden={i >= notices.length ? true : undefined}
              tabIndex={i >= notices.length ? -1 : undefined}
              className="relative whitespace-nowrap px-10 hover:underline after:absolute after:right-3 after:opacity-50 after:content-['•']"
            >
              {notice.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
