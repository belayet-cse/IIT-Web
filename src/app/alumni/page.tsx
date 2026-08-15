"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/shared/hero"
import { StatBar } from "@/components/shared/stat-bar"
import { ForumBanner } from "@/components/shared/forum-banner"
import { LockedOverlay } from "@/components/shared/locked-overlay"
import { GateCard } from "@/components/cards/gate-card"
import { buttonVariants } from "@/components/ui/button"
import { AlumCard } from "@/components/cards/alum-card"
import { Avatar } from "@/components/ui/avatar"
import { EventCard } from "@/components/cards/event-card"
import { StoryCard } from "@/components/cards/story-card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  getAlumniDirectory,
  getAlumniPreview,
  getAlumniStats,
  getMyApplication,
  type AlumniDirectoryEntry,
  type AlumniPreviewEntry,
  type AlumniStats,
  type MyApplicationStatus,
} from "@/lib/api"

export default function AlumniPage() {
  const { data: session, status } = useSession()
  const isLoggedIn = status === "authenticated"
  const isAlumni = session?.user?.role === "ALUMNI" || session?.user?.role === "ADMIN"
  const isPendingApplicant = isLoggedIn && !isAlumni

  const [stats, setStats] = useState<AlumniStats | null>(null)
  const [preview, setPreview] = useState<AlumniPreviewEntry[]>([])
  const [directory, setDirectory] = useState<AlumniDirectoryEntry[]>([])
  const [directoryLoaded, setDirectoryLoaded] = useState(false)
  const [search, setSearch] = useState("")
  const [certification, setCertification] = useState("")
  const [country, setCountry] = useState("")
  const [myApplication, setMyApplication] = useState<MyApplicationStatus | null>(null)
  const [myApplicationLoaded, setMyApplicationLoaded] = useState(false)

  useEffect(() => {
    getAlumniStats().then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    if (isAlumni) return
    getAlumniPreview().then(setPreview).catch(() => {})
  }, [isAlumni])

  useEffect(() => {
    if (!isPendingApplicant || !session?.accessToken) return
    getMyApplication(session.accessToken)
      .then(setMyApplication)
      .catch(() => setMyApplication(null))
      .finally(() => setMyApplicationLoaded(true))
  }, [isPendingApplicant, session?.accessToken])

  useEffect(() => {
    if (!isAlumni || !session?.accessToken) return
    const token = session.accessToken
    // Fetch immediately on first load (or when filters are cleared back to empty);
    // debounce only kicks in once the alumni has actually typed a search term.
    const delay = search || certification || country ? 250 : 0
    const timeout = setTimeout(() => {
      getAlumniDirectory(token, { search, certification, country })
        .then(setDirectory)
        .catch(() => {})
        .finally(() => setDirectoryLoaded(true))
    }, delay)
    return () => clearTimeout(timeout)
  }, [isAlumni, session?.accessToken, search, certification, country])

  if (status === "loading") {
    return (
      <>
        <TopNav />
        <main className="min-h-[60vh] flex items-center justify-center text-muted-foreground text-sm">
          Loading…
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <TopNav />
      <main>

        {/* Hero */}
        <Hero
          eyebrow="Alumni Network"
          title="Alumni Network"
          subtitle="Connect with IIT graduates across the global trade finance community. Find mentors, colleagues, and career opportunities."
        />

        {/* Stats */}
        <StatBar
          stats={[
            { value: stats ? String(stats.registeredAlumni) : "—", label: "Registered Alumni" },
            { value: stats ? String(stats.countries) : "—", label: "Countries Represented" },
            { value: stats ? String(stats.certifiedAlumni) : "—", label: "Certified Alumni" },
            { value: "12", label: "Alumni Events / Year" },
          ]}
        />

        {/* ── STATE A: Guest / logged-in non-alumni ── */}
        {!isAlumni && (!isPendingApplicant || myApplicationLoaded) && (
          <section className="py-16">
            <div className="max-w-[1180px] mx-auto px-6">

              {isPendingApplicant && myApplication?.status === "PENDING" ? (
                <div className="max-w-[560px] mx-auto text-center bg-card border border-border rounded-xl p-10">
                  <div className="w-14 h-14 rounded-full bg-warning-bg flex items-center justify-center mx-auto mb-5">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <h2 className="font-heading text-[26px] text-navy mb-2">Application under review</h2>
                  <p className="text-sm text-muted-foreground">
                    Thanks, {session?.user?.name}. Your alumni application (submitted{" "}
                    {new Date(myApplication.appliedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    ) is with IIT admin for review — typically 3–5 business days. You'll gain full
                    directory access as soon as it's approved.
                  </p>
                </div>
              ) : isPendingApplicant && myApplication?.status === "REJECTED" ? (
                <div className="max-w-[560px] mx-auto text-center bg-card border border-border rounded-xl p-10">
                  <h2 className="font-heading text-[26px] text-navy mb-2">Application not approved</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    {myApplication.rejectionReason ||
                      "Your previous alumni application wasn't approved. You're welcome to reapply with updated details."}
                  </p>
                  <Link href="/alumni/apply" className={buttonVariants({ variant: "default", size: "xl" })}>
                    Reapply for Membership →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-10">
                    <h2 className="font-heading text-[30px] text-navy mb-2">
                      {isPendingApplicant ? "Apply for Alumni Membership" : "Join the Network"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {isPendingApplicant
                        ? `Welcome, ${session?.user?.name}. You're signed in but haven't applied for alumni membership yet.`
                        : "Sign in with your alumni account, or apply if this is your first time here."}
                    </p>
                  </div>

                  <div
                    className={
                      isPendingApplicant
                        ? "max-w-[420px] mx-auto"
                        : "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[840px] mx-auto"
                    }
                  >
                    {!isPendingApplicant && (
                      <GateCard
                        variant="primary"
                        tag="Already a member"
                        title="Sign In"
                        description="Access the full alumni directory, contact details, events, and the private discussion forum."
                        buttonLabel="Sign In as Alumni"
                        buttonHref="/login"
                      />
                    )}
                    <GateCard
                      variant="outline"
                      tag="First time here"
                      title="Apply for Membership"
                      description="Submit your details for admin verification. Most applications are reviewed within 3–5 business days."
                      buttonLabel="Start Application"
                      buttonHref="/alumni/apply"
                    />
                  </div>

                  <p className="max-w-[840px] mx-auto mt-[22px] text-center text-[12.5px] text-muted-foreground">
                    Honorary members are added directly by IIT admin and do not need to apply. If you believe
                    you already have alumni access, contact{" "}
                    <strong className="text-navy">iitrade.org@gmail.com</strong>.
                  </p>
                </>
              )}

              {/* Locked directory preview */}
              <div className="mt-14">
                <LockedOverlay
                  title="Directory locked"
                  description="Sign in as a verified alumni member to view full profiles and contact information."
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
                    {preview.map((a) => (
                      <div key={a.initials + a.name} className="bg-card border border-border rounded-xl p-[22px] text-center">
                        <Avatar initials={a.initials} className="mx-auto mb-3" />
                        <div className="text-sm font-bold text-navy mb-[2px]">{a.name}</div>
                        <div className="text-xs text-muted-foreground mb-[2px]">{a.role}</div>
                        <div className="text-xs text-muted-foreground">{a.org}</div>
                      </div>
                    ))}
                  </div>
                </LockedOverlay>
              </div>
            </div>
          </section>
        )}

        {/* ── STATE B: Verified Alumni ── */}
        {isAlumni && (
          <>
            <section className="py-16 bg-muted/40">
              <div className="max-w-[1180px] mx-auto px-6">
                <div className="text-center mb-10">
                  <h2 className="font-heading text-[30px] text-navy mb-2">Alumni Directory</h2>
                  <p className="text-sm text-muted-foreground">
                    Connect with our growing network of international trade professionals.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex gap-3 mb-7 flex-wrap">
                  <Input
                    placeholder="Search alumni by name, company…"
                    className="flex-1 min-w-[200px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Select
                    className="w-auto min-w-[180px]"
                    value={certification}
                    onChange={(e) => setCertification(e.target.value)}
                  >
                    <option value="">All Certifications</option>
                    <option value="CDCS">CDCS</option>
                    <option value="CSDG">CSDG</option>
                    <option value="CITF">CITF</option>
                  </Select>
                  <Select
                    className="w-auto min-w-[160px]"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="">All Countries</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Singapore">Singapore</option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[18px]">
                  {directoryLoaded && directory.length === 0 && (
                    <p className="col-span-full text-center text-sm text-muted-foreground py-10">
                      No alumni found.
                    </p>
                  )}
                  {directory.map((a) => (
                    <AlumCard key={a.contact.email} {...a} />
                  ))}
                </div>
              </div>
            </section>

            {/* Forum CTA */}
            <section className="pb-16">
              <div className="max-w-[1180px] mx-auto px-6">
                <ForumBanner
                  title="Alumni Discussion Forum"
                  description="Start a topic or join ongoing discussions with fellow alumni — market insight, career moves, mentorship requests, and more."
                  buttonLabel="Enter Discussion Forum"
                  buttonHref="/alumni/forum"
                />
              </div>
            </section>
          </>
        )}

        {/* Alumni Events — always visible */}
        <section className="py-16 bg-muted/40">
          <div className="max-w-[1180px] mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="font-heading text-[30px] text-navy mb-2">Alumni Events</h2>
              <p className="text-sm text-muted-foreground">
                Exclusive networking events, reunions, and webinars for IIT alumni.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
              <EventCard
                tag="Alumni Reunion"
                title="IIT Annual Alumni Gathering 2026"
                description="A networking dinner for all IIT alumni to reconnect and celebrate the community's growth."
                date="August 28, 2026"
                location="Dhaka, Bangladesh"
                rsvpHref="/alumni/events/reunion-2026"
              />
              <EventCard
                tag="Webinar"
                title="Career Growth in Trade Finance — Alumni Panel"
                description="Senior alumni share career insights and the impact of IIT certifications on their trajectory."
                date="June 22, 2026"
                location="Online"
                rsvpHref="/alumni/events/webinar-june"
              />
              <EventCard
                tag="Mentorship"
                title="Alumni Mentorship Matching Session"
                description="Connect with junior members working towards the IIT community through structured mentorship."
                date="May 30, 2026"
                location="Alumni Only"
                rsvpHref="/alumni/events/mentorship-may"
              />
            </div>
          </div>
        </section>

        {/* Alumni Stories — always visible */}
        <section className="py-16">
          <div className="max-w-[1180px] mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="font-heading text-[30px] text-navy mb-2">Alumni Stories</h2>
              <p className="text-sm text-muted-foreground">
                Real stories from IIT graduates who transformed their careers.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px]">
              <StoryCard
                initials="RA"
                quote="Passing the CDCS through IIT's program gave me the confidence and credibility to move into leadership at Standard Bank."
                name="Rafiq Ahmed"
                role="Trade Finance Manager, Standard Bank"
              />
              <StoryCard
                initials="NI"
                quote="The CSDG and CDCS combination through IIT positioned me perfectly for my current role overseeing trade operations at HSBC."
                name="Nafisa Islam"
                role="Head of Trade Ops, HSBC Bangladesh"
              />
              <StoryCard
                initials="KH"
                quote="Beyond the certification itself, the alumni network connected me with mentors I still turn to today."
                name="Karim Hasan"
                role="CDCS Certified, Contic Bank"
              />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
