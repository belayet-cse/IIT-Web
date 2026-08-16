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

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service" updated="August 17, 2026">
      <P>
        These Terms of Service (&quot;Terms&quot;) govern your use of iitrade.org, operated by the Institute of
        International Trade (&quot;IIT&quot;, &quot;we&quot;, &quot;us&quot;). By creating an account or using the
        site, you agree to these Terms.
      </P>

      <H>Accounts</H>
      <List
        items={[
          "You must provide accurate information when registering and keep it up to date.",
          "You are responsible for maintaining the confidentiality of your password and for all activity under your account.",
          "Alumni and Researcher status are subject to verification and approval; we may decline or revoke either where eligibility criteria aren't met.",
        ]}
      />

      <H>Membership, Certifications & Purchases</H>
      <List
        items={[
          "Premium membership tiers, certification programs, and individual paid content (blog posts, research papers) are described on their respective pages, including price and any Premium/Alumni discount that applies to your account.",
          "Placing an order records your purchase intent; access or enrollment is granted once payment is confirmed.",
          "Premium membership renews on an annual basis and expires if not renewed; you'll be notified by email in advance.",
          "Refunds, where applicable, are handled on a case-by-case basis — contact us at the email below.",
        ]}
      />

      <H>Acceptable Use</H>
      <P>You agree not to:</P>
      <List
        items={[
          "Share your account credentials or paid content/course access with others.",
          "Use the discussion forum, Q&A, or contact tools to post unlawful, abusive, or misleading content.",
          "Attempt to access areas of the platform you are not authorized to use, or interfere with its normal operation.",
          "Reproduce, redistribute, or resell IIT's certification materials, research papers, or blog content without permission.",
        ]}
      />

      <H>Intellectual Property</H>
      <P>
        Course materials, certification curricula, research papers, blog content, and the IIT name and logo are the
        property of IIT or its licensors. Purchasing access to content grants you a personal, non-transferable
        license to use it — it does not transfer ownership.
      </P>

      <H>Content You Submit</H>
      <P>
        If you post in the discussion forum, submit a Q&A question, or apply as an Alumni or Researcher, you remain
        responsible for that content and confirm you have the right to share it. We may remove content that
        violates these Terms.
      </P>

      <H>Disclaimer & Limitation of Liability</H>
      <P>
        The platform and its content are provided &quot;as is.&quot; While we aim for accuracy, IIT does not
        guarantee that certification programs or content will meet every individual&apos;s professional or
        regulatory requirements. To the extent permitted by law, IIT is not liable for indirect or consequential
        losses arising from use of the platform.
      </P>

      <H>Changes to the Service or Terms</H>
      <P>
        We may update these Terms or modify the platform&apos;s features from time to time. Continued use after a
        change constitutes acceptance of the updated Terms.
      </P>

      <H>Governing Law</H>
      <P>These Terms are governed by the laws of Bangladesh.</P>

      <H>Contact Us</H>
      <P>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:iitrade.org@gmail.com" className="text-gold hover:underline">
          iitrade.org@gmail.com
        </a>
        .
      </P>
    </LegalPage>
  )
}
