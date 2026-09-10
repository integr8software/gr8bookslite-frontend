# Gr8Books Neo policy update — 10 September 2026

The public policy content is maintained in `app/src/data/legal/LegalPolicyData.ts`
and rendered by `app/src/ui/legal/LegalPolicyPage.tsx`.

Updated pages:

- `/terms-of-service` (PayMongo clause: `#recurring-payments`)
- `/privacy-policy`
- `/return-and-refund-policy`

All three routes are already unrestricted public routes in `AuthProxyGuard.ts`
and linked from the landing-page footer. No deployment or PayMongo submission
was performed by this change. After deployment, provide PayMongo the public
Terms URL, as requested in its email.

## Source and editorial decisions

Based on the two Gr8Books Neo Word documents supplied by the owner and the
PayMongo email screenshot. The recurring payments paragraph is reproduced
verbatim in the Terms, with a link from the refund policy. The refund policy
uses the supplied document's eligibility rules and 5–10 business day initiation
period, replacing the old page's seven-day initial-purchase rule and guaranteed
bank receipt timeline.

The Terms template's unapproved numerical liability cap and exclusive venue
were not invented: the revised wording defers to applicable law and any signed
agreement. The existing Terms' six-month inactivity/deletion rule is now
consistent across the Terms and Privacy Policy; the old Privacy page's conflicting
seven-year retention and 30-day deletion promises were removed.

Reference checks:

- https://docs.paymongo.com/docs/payment-acceptance-refunds
- https://www.paymongo.com/en/privacy
- https://privacy.gov.ph/data-subject-rights/

## Details still needed before submission

The provided Word documents leave the registered business address, official
support/billing and DPO contacts blank. The pages temporarily retain the existing
`gr8booklite.com` contact emails; these have not been verified as operational or
as the DPO's mailbox. The owner has been asked for the correct details. Address
and phone must be added once supplied.

Confirm the stated retention/export practice and actual OCR/AI provider handling
with the responsible operator/DPO. The revised public text does not claim an
unverified blanket prohibition on third-party model training or encryption at rest.

The required recurring-payment clause commits INTEGR8 to notify cardholders of
both success and failure. Inspection of `paymongo-webhook.service.ts` did not
identify customer email/notification delivery there. Verify end-to-end delivery
or the operational notification process before enabling recurring payments.
Policy text alone does not implement notifications. Likewise, checkout consent
and stored acceptance evidence were not changed in this policy-page refactor.

PayMongo's KYC review and approval remain outstanding; these edits do not
represent PayMongo certification.
