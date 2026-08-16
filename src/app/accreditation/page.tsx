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

export default function AccreditationPage() {
  return (
    <LegalPage eyebrow="Quality Standards" title="Accreditation & Curriculum Standards">
      <P>
        The Institute of International Trade designs and reviews its certification programs to reflect current
        practice in trade finance and international commerce. This page explains how we develop and maintain
        curriculum quality.
      </P>

      <H>How Our Programs Are Developed</H>
      <List
        items={[
          "Curricula are developed with input from practicing trade finance professionals, drawing on established international frameworks referenced throughout the industry (such as UCP 600 and related ICC rules).",
          "Course content is organized into structured modules with defined learning outcomes, available on each program's detail page before you enroll.",
          "Programs are reviewed periodically and updated to reflect changes in regulation, technology, and market practice.",
        ]}
      />

      <H>Certificates of Completion</H>
      <P>
        Learners who complete all modules of a certification program receive an IIT certificate of completion,
        confirming the program and modules completed. This certifies completion of IIT&apos;s own program — it is
        distinct from, and should not be represented as, certification by any external professional body unless
        explicitly stated on that program&apos;s page.
      </P>

      <H>Questions About a Specific Program</H>
      <P>
        For details on a specific program&apos;s curriculum, exam structure, or how it maps to industry-recognized
        practice, see that program&apos;s page under{" "}
        <Link href="/programs" className="text-gold hover:underline">
          Certification Programs
        </Link>
        , or contact us directly.
      </P>

      <H>Contact Us</H>
      <P>
        For accreditation or curriculum inquiries, email{" "}
        <a href="mailto:iitrade.org@gmail.com" className="text-gold hover:underline">
          iitrade.org@gmail.com
        </a>
        .
      </P>
    </LegalPage>
  )
}
