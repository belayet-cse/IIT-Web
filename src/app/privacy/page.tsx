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

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="August 17, 2026">
      <P>
        The Institute of International Trade (&quot;IIT&quot;, &quot;we&quot;, &quot;us&quot;) respects your privacy.
        This policy explains what information we collect through iitrade.org, how we use it, and the choices you
        have.
      </P>

      <H>Information We Collect</H>
      <P>When you register for an account, apply for alumni or researcher status, or contact us, we collect:</P>
      <List
        items={[
          "Account details you provide: name, email address, phone number, and organization.",
          "Alumni and researcher application details: professional background, certifications, and supporting documents you choose to submit.",
          "Membership and purchase records: which plan, certification, blog post, or research paper you've expressed interest in or purchased, and the amount and currency involved.",
          "Messages you send us through the contact form.",
          "Basic technical information such as IP-derived country (used only to default your checkout currency).",
        ]}
      />

      <H>How We Use Your Information</H>
      <List
        items={[
          "To create and manage your account, and to verify alumni and researcher eligibility.",
          "To process membership, certification, and content purchases, and to grant the access they entitle you to.",
          "To send account, membership, and purchase-related notifications (e.g. password resets, membership expiry reminders, enrollment confirmations).",
          "To respond to inquiries submitted through our contact form.",
          "To maintain the security and integrity of the platform.",
        ]}
      />

      <H>How We Share Information</H>
      <P>
        We do not sell your personal information. We share it only where necessary to operate the platform — for
        example, with our database and email-delivery providers who process data on our behalf — or where required
        by law. Payment processing, once live, will be handled by third-party payment gateways under their own
        privacy terms.
      </P>

      <H>Data Retention</H>
      <P>
        We retain account and transaction records for as long as your account is active and as needed to meet
        legal, accounting, and reporting obligations. You may request deletion of your account as described below.
      </P>

      <H>Your Rights</H>
      <P>
        You can review and update most of your account details from your profile settings. To request a copy,
        correction, or deletion of your personal information, email us at{" "}
        <a href="mailto:iitrade.org@gmail.com" className="text-gold hover:underline">
          iitrade.org@gmail.com
        </a>
        . We will respond within a reasonable timeframe.
      </P>

      <H>Cookies</H>
      <P>
        We use essential cookies to keep you signed in and to remember your session. We do not currently use
        third-party advertising or tracking cookies.
      </P>

      <H>Children&apos;s Privacy</H>
      <P>Our services are intended for professionals and are not directed at individuals under the age of 16.</P>

      <H>Changes to This Policy</H>
      <P>
        We may update this policy from time to time. Material changes will be reflected by updating the &quot;Last
        updated&quot; date above.
      </P>

      <H>Contact Us</H>
      <P>
        Questions about this policy can be sent to{" "}
        <a href="mailto:iitrade.org@gmail.com" className="text-gold hover:underline">
          iitrade.org@gmail.com
        </a>{" "}
        or to our office at 11/1 Indira Road, Dhaka, Bangladesh.
      </P>
    </LegalPage>
  )
}
