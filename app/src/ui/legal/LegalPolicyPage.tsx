import Link from "next/link";
import { LegalPolicyContacts } from "@/app/src/data/legal/LegalPolicyData";
import type { LegalPolicy } from "@/app/src/types/legal/LegalPolicyTypes";
import { LandingDocumentHeader } from "@/app/src/ui/shared/layout/DocumentHeader";

export function LegalPolicyPage({ policy }: Readonly<{ policy: LegalPolicy }>) {
  return (
    <main className="min-h-screen bg-white text-darknavy">
      <LandingDocumentHeader title={policy.title} lastUpdated={policy.updated} tone="indigo" />
      <article className="mx-auto max-w-4xl space-y-8 px-6 py-10 leading-7">
        <div className="space-y-3">
          <p className="font-semibold">{LegalPolicyContacts.company}</p>
          {policy.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {policy.sections.map((section, index) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-24 space-y-3">
            <h2 id={`${section.id}-heading`} className="text-xl font-semibold">
              {index + 1}. {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul className="list-disc space-y-2 pl-6">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.links?.map((link) => (
              <p key={link.href}>
                <Link href={link.href} className="underline underline-offset-4 hover:no-underline">
                  {link.label}
                </Link>
              </p>
            ))}
          </section>
        ))}
        <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-24 space-y-3 border-t border-darknavy/15 pt-6">
          <h2 id="contact-heading" className="text-xl font-semibold">
            {policy.sections.length + 1}. Contact us
          </h2>
          <p>{LegalPolicyContacts.company}</p>
          <p>
            Support and cancellation:{" "}
            <a className="break-words underline" href={`mailto:${LegalPolicyContacts.supportEmail}`}>
              {LegalPolicyContacts.supportEmail}
            </a>
          </p>
          <p>
            Billing and refunds:{" "}
            <a className="break-words underline" href={`mailto:${LegalPolicyContacts.billingEmail}`}>
              {LegalPolicyContacts.billingEmail}
            </a>
          </p>
          <p>
            Privacy requests / Data Protection Officer:{" "}
            <a className="break-words underline" href={`mailto:${LegalPolicyContacts.privacyEmail}`}>
              {LegalPolicyContacts.privacyEmail}
            </a>
          </p>
          <p>
            Website:{" "}
            <a className="underline" href={LegalPolicyContacts.website}>
              www.integr8.com.ph
            </a>
          </p>
        </section>
      </article>
    </main>
  );
}
