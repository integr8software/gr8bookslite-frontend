import type { LegalPolicy } from "@/app/src/types/legal/LegalPolicyTypes";
// Source: Gr8Books Neo policy documents supplied on 10 September 2026.
// Company contacts still require confirmation before publication.
export const LegalPolicyContacts = {
  company: "INTEGR8 SOFTWARE SOLUTIONS, INC.",
  website: "https://www.integr8.com.ph",
  supportEmail: "gr8neo_support@integr8.com.ph",
  billingEmail: "gr8neo_billing@integr8.com.ph",
  privacyEmail: "gr8neo_privacy@integr8.com.ph",
};
export const PayMongoRecurringPaymentsClause =
  "By agreeing to recurring payments, the cardholder authorizes PayMongo to automatically deduct payment from the given credit/debit card account until he/she revokes such authorization. The payments shall be charged at the start of each billing cycle, which shall be dependent on the agreed products/plans. After the processing of payment, the Merchant shall reach out to the cardholder if his/her payment is successful or not. PayMongo shall not be held liable for the Merchant's failure to notify the cardholder regarding the payment status. The cardholder further acknowledges and agrees that the billing cycle and amount to be deducted are dependent on the instructions made by the Merchant to PayMongo.";
export const TermsOfServicePolicy = {
  title: "Terms of Service",
  href: "/terms-of-service",
  updated: "September 10, 2026",
  intro: [
    'These Terms of Service ("Terms") govern access to and use of Gr8Books Neo ("Neo", "Service", or "Platform"), provided by INTEGR8 SOFTWARE SOLUTIONS, INC. ("INTEGR8", "we", "us", or "our"). By creating an account, subscribing, paying for, accessing, or using Neo, the customer and its authorized users agree to these Terms.',
    "These Terms should be read with our Privacy Policy and Return and Refund Policy. A signed commercial agreement governs any expressly agreed differences, subject to mandatory law.",
  ],
  sections: [
    {
      id: "eligibility-and-account-registration",
      title: "Eligibility and Account Registration",
      paragraphs: [
        "Customers must provide accurate registration and billing information and keep it current. The customer is responsible for selecting authorized users, assigning appropriate access rights, protecting login credentials, and all activity conducted through its accounts, except to the extent caused by INTEGR8's breach of its obligations.",
        "The customer must promptly notify INTEGR8 of suspected unauthorized access or compromise.",
      ],
    },
    {
      id: "the-gr8books-neo-service",
      title: "The Gr8Books Neo Service",
      paragraphs: [
        "Neo is a cloud-based business software platform that may include accounting, inventory, billing, purchasing, sales, reporting, tax-related tools, document capture/OCR, automation, AI-assisted features, integrations, and other modules made available under the customer's subscribed plan.",
        "Features, usage limits, storage, integrations, and modules may vary by plan. Optional or beta features may be governed by additional terms.",
      ],
    },
    {
      id: "subscription-fees-and-taxes",
      title: "Subscription, Fees and Taxes",
      paragraphs: [
        "Fees, billing cycle, included users, storage, document/OCR allowances, AI usage, and other plan limits are those shown in the applicable order, quotation, subscription page, or commercial agreement.",
        "Unless expressly stated otherwise, fees are exclusive of applicable taxes. The customer is responsible for taxes imposed on its purchase or use of the Service, except taxes imposed on INTEGR8's income.",
        "INTEGR8 may change pricing for future billing periods upon reasonable prior notice, subject to any fixed-price commitment in an existing written agreement.",
      ],
    },
    {
      id: "payments-and-paymongo",
      title: "Payments and PayMongo",
      paragraphs: [
        "Neo may use PayMongo Philippines, Inc. and/or its payment partners as third-party payment processors. When a customer chooses an available payment method, payment information may be transmitted directly to and processed by the applicable payment processor under its own terms and privacy practices.",
        "INTEGR8 may receive transaction information such as payment status, amount, payment reference, payment method category, payer details necessary for reconciliation, and processor-generated identifiers. INTEGR8 does not represent that it stores full card credentials when those credentials are collected and processed directly by the payment processor.",
        "The customer authorizes INTEGR8 and its payment processors to charge the applicable fees using the selected payment method, including recurring charges where the customer has expressly enrolled in recurring billing. Failed or reversed payments may result in suspension after applicable notice.",
      ],
    },
    {
      id: "recurring-payments",
      title: "Recurring Payments Terms and Conditions",
      paragraphs: [
        "For this clause, the Merchant is INTEGR8 SOFTWARE SOLUTIONS, INC., the provider of Gr8Books Neo. Recurring billing applies only when you expressly enroll. The selected plan, charge amount, applicable taxes and billing interval are presented before you confirm your subscription.",
        PayMongoRecurringPaymentsClause,
        "INTEGR8 is responsible for notifying the cardholder of successful or unsuccessful payment after processing, using the registered billing contact details. Keep those details current. Pricing changes for future periods will be communicated before they take effect, so you can cancel before the next charge.",
      ],
    },
    {
      id: "renewal-cancellation-and-refunds",
      title: "Renewal, Cancellation and Refunds",
      paragraphs: [
        "You may cancel your subscription or revoke recurring payment authorization through your workspace billing and subscription settings or by contacting our billing/support team using the contact details below. Submit your request before the next scheduled billing date to stop the next renewal. We will confirm the cancellation and its effective date. Revoking authorization stops future automatic charges; it does not reverse a payment already processed or remove amounts already due. A renewal already charged is subject to the Return and Refund Policy.",
        "Refunds are governed by our Return and Refund Policy, including verified duplicate or erroneous charges, non-delivery of a purchased service, and refunds required by law. Cancellation alone does not entitle you to a refund for an already-started paid period.",
      ],
      links: [
        {
          label: "Return and Refund Policy",
          href: "/return-and-refund-policy",
        },
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use",
      paragraphs: [],
      bullets: [
        "Use Neo only for lawful business purposes and in accordance with applicable Philippine laws and regulations.",
        "Do not upload malicious code, attempt unauthorized access, probe or disrupt security, circumvent usage limits, or interfere with other customers.",
        "Do not reverse engineer, copy, resell, sublicense, scrape, or exploit Neo except as expressly permitted by INTEGR8 or applicable law.",
        "Do not use Neo to process unlawful, fraudulent, infringing, defamatory, or prohibited content.",
      ],
    },
    {
      id: "customer-data-and-data-ownership",
      title: "Customer Data and Data Ownership",
      paragraphs: [
        '"Customer Data" means data, records, files, documents, images, transactions, personal data, and other content submitted to or generated through the customer\'s use of Neo.',
        "As between the parties, the customer retains ownership of Customer Data. The customer grants INTEGR8 a limited right to host, process, transmit, back up, reproduce, and otherwise use Customer Data only as reasonably necessary to provide, secure, support, improve, and comply with legal obligations relating to the Service, subject to the Privacy Policy and applicable law.",
        "The customer is responsible for the legality, accuracy, quality, and necessary notices/consents relating to Customer Data it uploads or instructs Neo to process.",
      ],
    },
    {
      id: "accounting-tax-and-regulatory-features",
      title: "Accounting, Tax and Regulatory Features",
      paragraphs: [
        "Neo may assist with accounting entries, tax computations, reports, BIR-related data, forms, schedules, or filing preparation. Such functionality is a software aid and does not constitute legal, tax, audit, or professional accounting advice.",
        "The customer remains responsible for reviewing entries, classifications, tax treatment, filing obligations, due dates, and submissions before relying on or filing them. Where direct electronic filing or regulatory transmission becomes available, it will be offered only within the scope permitted by applicable authorities and applicable integration terms.",
      ],
    },
    {
      id: "ocr-automation-and-ai-assisted-features",
      title: "OCR, Automation and AI-Assisted Features",
      paragraphs: [
        "Neo may use optical character recognition, automated classification, rules, machine learning, or AI-assisted functions to extract or suggest information from invoices, receipts, documents, prompts, or transaction history. These outputs may be incomplete or inaccurate.",
        "Users must review material accounting, tax, payment, and business outputs before approval or posting. INTEGR8 may use third-party technology providers to process content for these functions, subject to appropriate contractual, privacy, and security safeguards.",
      ],
    },
    {
      id: "third-party-services-and-integrations",
      title: "Third-Party Services and Integrations",
      paragraphs: [
        "Neo may interoperate with payment processors, banks, cloud infrastructure, OCR/AI providers, government systems, or other third-party services. Availability of an integration may depend on the third party. INTEGR8 is not responsible for third-party services outside its reasonable control, but will handle personal data shared with service providers in accordance with the Privacy Policy and applicable law.",
      ],
    },
    {
      id: "security-backups-and-customer-responsibilities",
      title: "Security, Backups and Customer Responsibilities",
      paragraphs: [
        "INTEGR8 will implement reasonable organizational, physical, and technical safeguards appropriate to the nature of the Service and data processed. No internet or cloud service can guarantee absolute security or uninterrupted availability.",
        "Customers should maintain appropriate internal controls, access permissions, approval workflows, source-document retention, and independent copies/exports of critical records as required by their business continuity and legal obligations.",
      ],
    },
    {
      id: "service-availability-maintenance-and-support",
      title: "Service Availability, Maintenance and Support",
      paragraphs: [
        "INTEGR8 may perform scheduled or emergency maintenance and may modify the Service to maintain security, compliance, performance, or functionality. Specific service levels, support response times, or uptime commitments apply only if stated in a separate written SLA or subscription agreement.",
      ],
    },
    {
      id: "suspension-and-termination",
      title: "Suspension and Termination",
      paragraphs: [
        "INTEGR8 may suspend access for material non-payment, security risk, unlawful use, material breach, or where necessary to protect the Service or comply with law. Where practicable, INTEGR8 will provide notice and an opportunity to cure.",
        "If a company workspace remains inactive for six (6) months, or the account is terminated, company data may be permanently deleted from active systems. Subscription expiry may suspend access until renewal. Export needed records before account closure or the inactivity period expires; contact support for assistance with access or export. Backups are for operational recovery and do not guarantee continued customer access or restoration. Records required for legal, tax, billing, dispute-resolution or security purposes may be retained as necessary, subject to applicable law. Backup copies are removed or overwritten under applicable backup rotation procedures.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      paragraphs: [
        "Neo, including its software, source code, object code, interfaces, designs, workflows, documentation, trademarks, databases, models, templates, and related technology, is owned by or licensed to INTEGR8 and is protected by applicable intellectual property laws. No ownership is transferred to the customer under these Terms.",
        "Subject to payment and compliance with these Terms, INTEGR8 grants the customer a limited, non-exclusive, non-transferable right to use Neo during the subscription term for its internal business operations.",
      ],
    },
    {
      id: "confidentiality",
      title: "Confidentiality",
      paragraphs: [
        "Each party shall protect the other party's non-public confidential information using reasonable care and use it only for the purposes of the business relationship, except where disclosure is authorized or required by law.",
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      paragraphs: [
        "To the maximum extent permitted by law, Neo is provided on an 'as available' basis. INTEGR8 does not warrant that every feature will be error-free or uninterrupted, or that automated, OCR, AI, tax, or accounting outputs will always be accurate. Nothing in these Terms excludes warranties or rights that cannot lawfully be excluded.",
      ],
    },
    {
      id: "limitation-of-liability",
      title: "Limitation of Liability",
      paragraphs: [
        "To the maximum extent permitted by applicable law, neither party will be liable for indirect, incidental, special, exemplary, punitive, or consequential damages, including loss of profits or business opportunity, arising from the Service. Nothing in these Terms excludes liability or remedies that cannot lawfully be excluded. Any separately agreed liability cap applies only as set out in the applicable signed agreement and to the extent permitted by law.",
      ],
    },
    {
      id: "indemnity",
      title: "Indemnity",
      paragraphs: [
        "The customer will be responsible for claims arising from its unlawful use of Neo, unlawful Customer Data, or material violation of these Terms, subject to applicable law and any negotiated enterprise agreement.",
      ],
    },
    {
      id: "changes-to-these-terms",
      title: "Changes to These Terms",
      paragraphs: [
        "INTEGR8 may update these Terms to reflect legal, regulatory, security, operational, or product changes. Material changes will be communicated through Neo, email, website notice, or another reasonable channel. The effective date will be updated.",
        "We will notify you at least 14 days before significant changes take effect.",
      ],
    },
    {
      id: "governing-law-and-disputes",
      title: "Governing Law and Disputes",
      paragraphs: [
        "These Terms are governed by the laws of the Republic of the Philippines. Please contact INTEGR8 first so we can attempt to resolve a concern. If unresolved, disputes may be brought before the competent courts under applicable law, subject to any valid dispute-resolution agreement. Nothing restricts mandatory statutory remedies or urgent relief available under law.",
      ],
    },
  ],
} as const satisfies LegalPolicy;
export const PrivacyPolicy = {
  title: "Privacy Policy",
  href: "/privacy-policy",
  updated: "September 10, 2026",
  intro: [
    "This Privacy Policy explains how INTEGR8 SOFTWARE SOLUTIONS, INC. processes personal data in connection with Gr8Books Neo. INTEGR8 is committed to complying with Republic Act No. 10173 (Data Privacy Act of 2012), its implementing rules, applicable National Privacy Commission issuances, and other applicable privacy laws.",
  ],
  sections: [
    {
      id: "roles-personal-information-controller-and-processor",
      title: "Roles: Personal Information Controller and Processor",
      paragraphs: [
        "Depending on the processing activity, INTEGR8 may act as a Personal Information Controller (PIC), for example for customer account, billing, sales, support, security, and website data, and/or as a Personal Information Processor (PIP) when processing personal data contained in Customer Data on the customer's documented instructions.",
        "Where the customer determines the purposes and means of processing personal data in its Neo database, the customer remains responsible for its own obligations as PIC.",
      ],
    },
    {
      id: "personal-data-we-may-collect",
      title: "Personal Data We May Collect",
      paragraphs: [],
      bullets: [
        "Account and identity data: name, username, email, telephone number, company, role, and account identifiers.",
        "Business and billing data: company information, subscription, invoices, payment status, transaction references, and billing contact details.",
        "Customer Data: accounting records, customer/supplier information, employee/user information, invoices, receipts, attachments, inventory and transaction data uploaded to Neo.",
        "Technical and usage data: IP address, device/browser information, login events, audit logs, feature usage, diagnostics, and security events.",
        "Support and communications data: inquiries, tickets, correspondence, training/support records, and feedback.",
        "OCR/AI content: documents, images, prompts, extracted fields, and related metadata submitted to applicable features.",
        "Payment data: payment method category and transaction metadata received from payment processors; sensitive payment credentials may be collected directly by the payment processor rather than INTEGR8.",
      ],
    },
    {
      id: "purposes-of-processing",
      title: "Purposes of Processing",
      paragraphs: [],
      bullets: [
        "Create and administer accounts and subscriptions.",
        "Provide accounting, inventory, reporting, OCR, AI, automation, payment, and other subscribed functionality.",
        "Authenticate users, enforce permissions, prevent fraud, investigate security events, and maintain audit trails.",
        "Process and reconcile payments and manage subscriptions.",
        "Provide support, implementation, training, notices, and service communications.",
        "Maintain, troubleshoot, secure, analyze, and improve Neo.",
        "Comply with legal, regulatory, tax, accounting, security, and lawful government requirements.",
        "Send marketing communications where permitted, subject to applicable consent and opt-out requirements.",
      ],
    },
    {
      id: "lawful-bases",
      title: "Lawful Bases",
      paragraphs: [
        "INTEGR8 processes personal data only where a lawful basis exists under applicable Philippine privacy law, which may include consent, performance of a contract, compliance with legal obligations, protection of lawful rights and interests, and other bases permitted by law. Sensitive personal information will be processed only where an applicable legal basis and safeguards exist.",
      ],
    },
    {
      id: "paymongo-and-payment-processing",
      title: "PayMongo and Payment Processing",
      paragraphs: [
        "When PayMongo or another payment processor is used, payment information required to complete the transaction may be provided directly to that processor. The processor may independently process personal data under its own privacy notice and regulatory obligations.",
        "INTEGR8 may receive limited payment and reconciliation information from the processor. Customers should review the applicable payment processor's privacy notice before completing payment.",
      ],
      links: [
        {
          label: "PayMongo Privacy Policy",
          href: "https://www.paymongo.com/en/privacy",
        },
      ],
    },
    {
      id: "ocr-ai-and-automated-processing",
      title: "OCR, AI and Automated Processing",
      paragraphs: [
        "Documents or data submitted to OCR or AI-assisted features may be transmitted to approved technology providers solely as necessary to provide those functions, subject to contractual safeguards. Neo may generate extracted fields, classifications, suggestions, or confidence scores. Material decisions and accounting/tax postings should remain subject to authorized human review.",
        "Any use of personal data for a purpose beyond providing the requested OCR or AI function requires a lawful basis and applicable notices and safeguards. This policy does not grant blanket consent to use Customer Data to train third-party models.",
      ],
    },
    {
      id: "sharing-and-disclosure",
      title: "Sharing and Disclosure",
      paragraphs: [
        "INTEGR8 may disclose personal data to authorized personnel and service providers such as cloud hosting, security, communications, support, OCR/AI, analytics, and payment providers, only to the extent reasonably necessary for the stated purposes. INTEGR8 may also disclose information when required by law, lawful government process, or to protect legal rights and system security.",
        "INTEGR8 does not sell personal data.",
      ],
    },
    {
      id: "cross-border-processing",
      title: "Cross-Border Processing",
      paragraphs: [
        "Some service providers or infrastructure may process or store data outside the Philippines. Where cross-border processing occurs, INTEGR8 will implement appropriate contractual, organizational, and technical safeguards consistent with applicable Philippine data protection requirements.",
      ],
    },
    {
      id: "data-retention-and-deletion",
      title: "Data Retention and Deletion",
      paragraphs: [
        "Personal data will be retained only for as long as necessary for the purposes for which it was collected, the applicable customer agreement, legitimate business and security needs, and legal/regulatory retention requirements.",
        "If a company workspace remains inactive for six (6) months, or the account is terminated, company data may be permanently deleted from active systems. Subscription expiry may suspend access until renewal. Export needed records before account closure or the inactivity period expires; contact support for assistance with access or export. Backups are for operational recovery and do not guarantee continued customer access or restoration. Records required for legal, tax, billing, dispute-resolution or security purposes may be retained as necessary, subject to applicable law. Backup copies are removed or overwritten under applicable backup rotation procedures.",
      ],
    },
    {
      id: "security",
      title: "Security",
      paragraphs: [
        "INTEGR8 uses reasonable administrative, physical, and technical safeguards designed to protect personal data against accidental or unlawful destruction, alteration, disclosure, loss, misuse, and unauthorized access. Safeguards may include access controls, authentication, logging, encryption where appropriate, backups, vulnerability management, and incident-response procedures.",
      ],
    },
    {
      id: "personal-data-breaches",
      title: "Personal Data Breaches",
      paragraphs: [
        "INTEGR8 will investigate suspected personal data breaches and comply with applicable notification and reporting obligations. Where INTEGR8 acts as a PIP, it will notify the relevant customer/PIC in accordance with applicable law and contractual obligations.",
      ],
    },
    {
      id: "data-subject-rights",
      title: "Data Subject Rights",
      paragraphs: [
        "Subject to applicable law and valid exceptions, data subjects may exercise rights including the right to be informed, object, access, correct/rectify, erase or block, obtain data portability where applicable, lodge a complaint, and claim damages as provided by law.",
        "Send privacy requests to INTEGR8 using the privacy contact below, identifying the account and the right you wish to exercise. We may verify your identity and authority before acting. Where we process records on a customer’s instructions, we may refer or coordinate the request with that customer. You may withdraw consent for processing that relies on consent without affecting prior lawful processing, and may complain to the National Privacy Commission.",
      ],
      links: [
        {
          label: "National Privacy Commission: data subject rights",
          href: "https://privacy.gov.ph/data-subject-rights/",
        },
      ],
    },
    {
      id: "cookies-analytics-and-similar-technologies",
      title: "Cookies, Analytics and Similar Technologies",
      paragraphs: [
        "Neo and its public website may use cookies, local storage, logs, analytics, or similar technologies for authentication, security, preferences, performance, and analytics. Where legally required, users will be given appropriate notice and choices.",
      ],
    },
    {
      id: "children-s-data",
      title: "Children's Data",
      paragraphs: [
        "Neo is intended for business use and is not directed to children. Customers must not knowingly use Neo to collect children's personal data unless they have a lawful basis, appropriate notices/consents, and safeguards required by applicable law.",
      ],
    },
    {
      id: "privacy-policy-changes",
      title: "Privacy Policy Changes",
      paragraphs: [
        "INTEGR8 may update this Privacy Policy when its processing practices, service providers, products, or legal obligations change. Material changes will be communicated by reasonable means and the effective date will be updated.",
      ],
    },
  ],
} as const satisfies LegalPolicy;
export const ReturnAndRefundPolicy = {
  title: "Return & Refund Policy",
  href: "/return-and-refund-policy",
  updated: "September 10, 2026",
  intro: [
    'This Return and Refund Policy explains how cancellations, refunds, duplicate payments, and billing concerns are handled for subscriptions, add-ons, and other digital services purchased for Gr8Books Neo from INTEGR8 SOFTWARE SOLUTIONS, INC. ("INTEGR8", "we", "us", or "our"). Because Gr8Books Neo is a cloud-based software service, there is no physical product to return.',
  ],
  sections: [
    {
      id: "scope",
      title: "Scope",
      paragraphs: [
        "This Policy applies to payments made for Gr8Books Neo subscriptions, user or company add-ons, AI/OCR or storage add-ons, implementation or onboarding fees, and other Gr8Books Neo services where applicable. If a written Sales Quotation, Subscription Agreement, Order Form, or other signed agreement contains refund terms that are different from this Policy, the signed agreement will govern to the extent of the inconsistency.",
      ],
    },
    {
      id: "subscription-cancellations",
      title: "Subscription Cancellations",
      paragraphs: [
        "You may cancel your subscription or revoke recurring payment authorization through your workspace billing and subscription settings or by contacting our billing/support team using the contact details below. Submit your request before the next scheduled billing date to stop the next renewal. We will confirm the cancellation and its effective date. Revoking authorization stops future automatic charges; it does not reverse a payment already processed or remove amounts already due. A renewal already charged is subject to the Return and Refund Policy.",
        "Cancellation does not automatically entitle you to a refund for an already-paid subscription period that has started.",
      ],
    },
    {
      id: "non-returnable-nature-of-digital-services",
      title: "Non-Returnable Nature of Digital Services",
      paragraphs: [
        "Gr8Books Neo is a digital software-as-a-service product. Once access has been activated or the applicable service has been delivered, there is no physical return. Subscription fees, consumed usage, activated add-ons, completed implementation work, data migration work, training, customization, and third-party charges are generally non-refundable except when INTEGR8 approves a refund under this Policy or when required by applicable law.",
      ],
    },
    {
      id: "when-a-refund-may-be-approved",
      title: "When a Refund May Be Approved",
      paragraphs: ["INTEGR8 may approve a full or partial refund in the following situations:"],
      bullets: [
        "Duplicate or clearly erroneous payment for the same order or subscription.",
        "A payment was successfully charged but the corresponding Gr8Books Neo subscription or paid feature was not activated, and INTEGR8 is unable to provide the purchased service within a reasonable period after notice.",
        "INTEGR8 confirms a material billing error attributable to INTEGR8.",
        "INTEGR8 cancels a paid service before it is delivered and no reasonable substitute or credit is accepted by the customer.",
        "A refund is otherwise required by applicable Philippine law or expressly approved by INTEGR8 in writing.",
        "A recurring charge processed after a verified prior cancellation or revocation of authorization.",
      ],
    },
    {
      id: "situations-generally-not-eligible-for-refund",
      title: "Situations Generally Not Eligible for Refund",
      paragraphs: ["Refunds are generally not available for:"],
      bullets: [
        "Change of mind after the subscription or service has been activated.",
        "Failure to use the system during an active paid subscription period.",
        "Lack of internet access, incompatible customer equipment, or customer-side technical issues not caused by Gr8Books Neo.",
        "Customer failure to provide required data, approvals, access, or cooperation needed for implementation or onboarding.",
        "Partially consumed subscription periods, unless INTEGR8 approves a prorated refund.",
        "Custom development, configuration, implementation, migration, consulting, or training work already performed.",
        "Third-party costs already incurred or non-refundable fees charged by payment, messaging, OCR, AI, cloud, or other external providers.",
        "Suspension or termination due to fraud, misuse, unlawful activity, or material breach of the applicable agreement.",
      ],
    },
    {
      id: "duplicate-unauthorized-or-incorrect-charges",
      title: "Duplicate, Unauthorized, or Incorrect Charges",
      paragraphs: [
        "For duplicate or incorrect charges, please contact INTEGR8 promptly with the transaction date, amount, registered account or company name, payment reference, and supporting proof. If you believe a payment was unauthorized, notify INTEGR8 and your card issuer, bank, or payment provider promptly. INTEGR8 may request reasonable verification before processing a refund or billing adjustment.",
      ],
    },
    {
      id: "refund-request-procedure",
      title: "Refund Request Procedure",
      paragraphs: [
        "To request a refund, the customer should send a written request to INTEGR8 and include: (a) customer/company name; (b) registered Gr8Books Neo email address; (c) invoice, order, or payment reference; (d) date and amount paid; (e) reason for the request; and (f) supporting documents, if any. Refund requests should be submitted as soon as reasonably possible after the billing issue is discovered. INTEGR8 may request additional information needed to validate the request.",
        "Use the billing/support email below. Do not send your full card number, CVV, password, or one-time password. We will communicate the review outcome and, where approved, the refund amount and processing status.",
      ],
    },
    {
      id: "refund-processing",
      title: "Refund Processing",
      paragraphs: [
        "Approved refunds will normally be returned through the original payment method whenever practicable. INTEGR8 will generally initiate an approved refund within 5 to 10 business days after approval. The time for the amount to appear in the customer's account may vary depending on PayMongo, the card network, bank, e-wallet, or other payment provider. INTEGR8 is not responsible for processing delays caused solely by the customer's financial institution or payment provider.",
        "The 5 to 10 business days above refers to INTEGR8 initiating the approved refund, not a guaranteed date for funds to appear. If the original payment method cannot accept a refund, we will coordinate an appropriate alternative with you. Payment-provider limitations do not remove refund rights required by law.",
      ],
    },
    {
      id: "paymongo-and-payment-processing",
      title: "PayMongo and Payment Processing",
      paragraphs: [
        "Certain Gr8Books Neo payments may be processed through PayMongo Philippines, Inc. and/or its payment partners. Payment processing is subject to the applicable payment provider's own terms, operational rules, verification procedures, and processing timelines. A request submitted to INTEGR8 does not guarantee approval of a refund, and an approved refund may still be subject to the payment provider's processing requirements.",
      ],
    },
    {
      id: "recurring-payments-and-renewals",
      title: "Recurring Payments and Renewals",
      paragraphs: [
        "Where recurring billing is enabled with the customer's authorization, the applicable subscription fee may be charged on each billing date until the subscription is cancelled in accordance with the applicable subscription terms. Customers should submit cancellation requests before the next scheduled billing date to avoid the next renewal charge. A renewal charge already processed is subject to this Policy.",
      ],
      links: [
        {
          label: "Recurring Payments Terms and Conditions",
          href: "/terms-of-service#recurring-payments",
        },
      ],
    },
    {
      id: "promotional-discounted-and-bundled-plans",
      title: "Promotional, Discounted, and Bundled Plans",
      paragraphs: [
        "Promotional, discounted, bundled, or prepaid plans may have specific eligibility, minimum term, usage, or refund conditions stated in the offer, Sales Quotation, or Order Form. Those specific terms will apply together with this Policy.",
      ],
    },
    {
      id: "service-credits",
      title: "Service Credits",
      paragraphs: [
        "Instead of a cash refund, INTEGR8 may offer a service credit, subscription extension, or account credit when appropriate. Any such credit will be subject to the terms communicated at the time it is granted and will not be redeemable for cash unless expressly stated.",
        "A credit will not replace a legally required cash refund without your agreement where such an alternative is permitted by law.",
      ],
    },
    {
      id: "taxes-and-government-charges",
      title: "Taxes and Government Charges",
      paragraphs: [
        "Refunds will be processed in accordance with applicable tax and invoicing rules. Where a refund requires a credit memo, credit note, adjustment document, or other accounting or tax documentation, the customer agrees to provide reasonable information needed to complete the adjustment.",
      ],
    },
    {
      id: "changes-to-this-policy",
      title: "Changes to this Policy",
      paragraphs: [
        "INTEGR8 may update this Policy from time to time to reflect changes in Gr8Books Neo, payment methods, business practices, or applicable law. The version posted or otherwise made available at the time of the relevant transaction will generally apply, subject to any mandatory legal requirements.",
      ],
    },
  ],
} as const satisfies LegalPolicy;
