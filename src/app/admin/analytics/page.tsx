"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { AdminShell } from "@/components/layout/admin-shell"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { DataTable } from "@/components/admin/data-table"
import { adminNavGroups } from "@/components/admin/admin-nav"
import { getAdminAnalytics, type AdminAnalytics } from "@/lib/api"

function ViewsChart({ viewsByDay }: { viewsByDay: AdminAnalytics["viewsByDay"] }) {
  const max = Math.max(1, ...viewsByDay.map((d) => d.count))
  const width = 760
  const height = 160
  const barGap = 3
  const barWidth = (width - barGap * (viewsByDay.length - 1)) / viewsByDay.length

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height + 24} viewBox={`0 0 ${width} ${height + 24}`} className="min-w-[600px]">
        {viewsByDay.map((d, i) => {
          const barHeight = (d.count / max) * height
          const x = i * (barWidth + barGap)
          const y = height - barHeight
          const isFirstOfMonth = new Date(d.date).getDate() === 1
          return (
            <g key={d.date}>
              <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, d.count > 0 ? 2 : 0)} fill="var(--gold)" rx={1}>
                <title>{`${d.date}: ${d.count} view${d.count === 1 ? "" : "s"}`}</title>
              </rect>
              {(i === 0 || i === viewsByDay.length - 1 || isFirstOfMonth) && (
                <text x={x} y={height + 16} fontSize="9" fill="var(--muted-foreground)">
                  {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [data, setData] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    getAdminAnalytics(token)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} />}>
        <Topbar title="Analytics" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  const totalViews = data?.viewsByDay.reduce((sum, d) => sum + d.count, 0) ?? 0

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} activeItem="Analytics" />}>
      <Topbar
        title="Analytics"
        actions={
          <>
            {session?.user?.name && (
              <span className="text-[13px] text-muted-foreground hidden sm:inline">{session.user.name}</span>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-navy text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-lg hover:bg-navy/90 transition-colors"
            >
              View Live Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-1.5 border border-border text-[13px] font-semibold px-[18px] py-[10px] rounded-lg hover:bg-muted transition-colors"
            >
              Sign out
            </button>
          </>
        }
      />

      <div className="p-8 flex-1">
        {loading || !data ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
        ) : (
          <>
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-[16px] text-navy">Content Views — Last 30 Days</h2>
                <span className="text-[13px] text-muted-foreground">{totalViews} total views</span>
              </div>
              {totalViews === 0 ? (
                <p className="text-sm text-muted-foreground py-10 text-center">No views recorded in this window yet.</p>
              ) : (
                <ViewsChart viewsByDay={data.viewsByDay} />
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="font-heading text-[16px] text-navy mb-3">Top Blog Posts</h2>
                <DataTable
                  emptyMessage="No blog views yet."
                  columns={[
                    { key: "title", header: "Title" },
                    { key: "views", header: "Views" },
                  ]}
                  data={data.topBlogs}
                />
              </div>
              <div>
                <h2 className="font-heading text-[16px] text-navy mb-3">Top Research Papers</h2>
                <DataTable
                  emptyMessage="No research views yet."
                  columns={[
                    { key: "title", header: "Title" },
                    { key: "views", header: "Views" },
                  ]}
                  data={data.topResearch}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  )
}
