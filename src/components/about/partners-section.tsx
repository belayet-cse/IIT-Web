"use client"

import { useEffect, useState } from "react"
import { SectionHeader } from "@/components/shared/section-header"
import { getPartners, type Partner } from "@/lib/api"

export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPartners()
      .then(setPartners)
      .catch(() => setPartners([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || partners.length === 0) return null

  return (
    <section className="py-16 bg-background">
      <div className="max-w-[1180px] mx-auto px-8">
        <SectionHeader eyebrow="Our Network" title="Partners & Collaborators" className="mb-10" />
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {partners.map((partner) =>
            partner.websiteUrl ? (
              <a
                key={partner.id}
                href={partner.websiteUrl}
                target="_blank"
                rel="noreferrer"
                title={partner.name}
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={partner.logoUrl} alt={partner.name} className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={partner.id}
                src={partner.logoUrl}
                alt={partner.name}
                title={partner.name}
                className="h-10 w-auto object-contain grayscale opacity-70"
              />
            )
          )}
        </div>
      </div>
    </section>
  )
}
