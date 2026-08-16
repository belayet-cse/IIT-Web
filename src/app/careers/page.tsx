import Link from "next/link"
import { LegalPage } from "@/components/layout/legal-page"

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="font-heading text-[19px] text-navy mt-9 mb-3 first:mt-0">{children}</h2>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mb-4">{children}</p>
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground mb-4">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function CareersPage() {
  return (
    <LegalPage eyebrow="Join Us" title="Careers at IIT">
      <P>
        The Institute of International Trade is building a global center of excellence for trade education and
        research. We&apos;re a small, growing team — there are no open positions listed at this time, but we&apos;re
        always glad to hear from people who share our mission.
      </P>

      <H>Areas We Typically Look For</H>
      <List
        items={[
          "Trade finance and international commerce practitioners interested in curriculum development or teaching",
          "Researchers and writers covering trade policy, regulation, and digital trade",
          "Program and alumni relations coordinators",
          "Platform and operations support",
        ]}
      />

      <H>Speculative Applications</H>
      <P>
        If you&apos;d like to be considered for future opportunities, send your CV and a short note about what
        you&apos;re interested in to{" "}
        <a href="mailto:iitrade.org@gmail.com" className="text-gold hover:underline">
          iitrade.org@gmail.com
        </a>
        . We keep applications on file and reach out when a relevant opening comes up.
      </P>

      <H>Researcher Track</H>
      <P>
        If your interest is specifically in research and Q&amp;A contributions rather than a formal role, see our{" "}
        <Link href="/researcher" className="text-gold hover:underline">
          Researcher program
        </Link>{" "}
        — it&apos;s a separate, lighter-weight way to contribute.
      </P>
    </LegalPage>
  )
}
