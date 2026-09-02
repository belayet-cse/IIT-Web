"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { AdminShell } from "@/components/layout/admin-shell"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { Badge } from "@/components/ui/badge"
import { adminNavGroups } from "@/components/admin/admin-nav"
import { getAdminStats, type AdminStats } from "@/lib/api"

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="text-section-label text-muted-foreground mb-2">{label}</div>
      <div className="font-heading text-[32px] text-navy">{value}</div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const token = session?.accessToken

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    getAdminStats(token)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  if (!token) {
    return (
      <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} />}>
        <Topbar title="Admin Dashboard" />
        <div className="p-8 flex-1 text-sm text-muted-foreground">Loading…</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell sidebar={<Sidebar navGroups={adminNavGroups} />}>
      <Topbar
        title="Admin Dashboard"
        actions={
          <>
            {session?.user?.name && (
              <span className="text-[13px] text-muted-foreground hidden sm:inline">{session.user.name}</span>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-navy text-white text-[13px] font-semibold px-[18px] py-[10px] rounded-sm hover:bg-navy/90 transition-colors"
            >
              View Live Site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-1.5 border border-border text-[13px] font-semibold px-[18px] py-[10px] rounded-sm hover:bg-muted transition-colors"
            >
              Sign out
            </button>
          </>
        }
      />

      <div className="p-8 flex-1">
        {loading || !stats ? (
          <p className="text-sm text-muted-foreground py-10 text-center">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Blogs" value={stats.totalBlogs} />
              <StatCard label="Published Blogs" value={stats.publishedBlogs} />
              <StatCard label="Total Alumni" value={stats.totalAlumni} />
              <StatCard label="Pending Applications" value={stats.pendingApplications} />
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <h2 className="font-heading text-[16px] text-navy">Recent Blog Posts</h2>
                <Link href="/admin/blogs" className="text-gold text-[13px] font-semibold hover:underline">
                  View all →
                </Link>
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-section-label text-muted-foreground px-5 py-3 border-b border-border bg-background">
                      Title
                    </th>
                    <th className="text-left text-section-label text-muted-foreground px-5 py-3 border-b border-border bg-background">
                      Status
                    </th>
                    <th className="text-left text-section-label text-muted-foreground px-5 py-3 border-b border-border bg-background">
                      Views
                    </th>
                    <th className="text-left text-section-label text-muted-foreground px-5 py-3 border-b border-border bg-background">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBlogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-[13.5px] text-muted-foreground">
                        No blog posts yet.
                      </td>
                    </tr>
                  ) : (
                    stats.recentBlogs.map((post) => (
                      <tr key={post.id}>
                        <td className="px-5 py-[14px] text-[13px] border-b border-[#f1f2f5] last:border-b-0 align-middle font-semibold text-navy">
                          {post.title}
                        </td>
                        <td className="px-5 py-[14px] text-[13px] border-b border-[#f1f2f5] last:border-b-0 align-middle">
                          <Badge variant={post.status === "PUBLISHED" ? "verified" : "pending"}>
                            {post.status === "PUBLISHED" ? "Published" : "Draft"}
                          </Badge>
                        </td>
                        <td className="px-5 py-[14px] text-[13px] border-b border-[#f1f2f5] last:border-b-0 align-middle">
                          {post.views}
                        </td>
                        <td className="px-5 py-[14px] text-[13px] border-b border-[#f1f2f5] last:border-b-0 align-middle">
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  )
}
