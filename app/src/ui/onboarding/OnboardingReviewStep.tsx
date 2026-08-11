"use client";

import { Building2, CalendarDays, Mail, MapPin, Phone, ReceiptText } from "lucide-react";
import { FormatOnboardingReportDateLabel } from "@/app/src/data/onboarding/OnboardingData";
import type { OnboardingValues } from "@/app/src/types/onboarding/OnboardingTypes";
import { OnboardingActionRow } from "@/app/src/ui/onboarding/OnboardingActionRow";

type OnboardingReviewStepProps = {
  values: OnboardingValues;
  logoPreviewUrl: string;
  isSubmitting: boolean;
  handleBack: () => void;
  handleFinish: () => void;
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-darknavy/10 py-4 last:border-b-0">
      <dt className="text-sm text-darknavy/45">{label}</dt>
      <dd className="max-w-[65%] text-right text-sm font-semibold text-darknavy">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function CompanyLogo({
  previewUrl,
  companyName,
}: {
  previewUrl: string;
  companyName: string;
}) {
  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_10px_30px_rgba(33,39,56,0.14)] ring-1 ring-darknavy/10 sm:h-28 sm:w-28">
      {previewUrl ? (
        // User-uploaded preview URLs can be blob or backend-hosted values.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={`${companyName || "Company"} logo`}
          loading="lazy"
          className="h-full w-full object-contain p-3"
        />
      ) : (
        <Building2 className="h-10 w-10 text-darknavy/25" aria-hidden="true" />
      )}
    </div>
  );
}

export function OnboardingReviewStep({
  values,
  logoPreviewUrl,
  isSubmitting,
  handleBack,
  handleFinish,
}: OnboardingReviewStepProps) {
  const isIndividual = values.taxpayerType === "individual";
  const displayName = isIndividual
    ? [values.firstName, values.middleName, values.lastName]
        .filter(Boolean)
        .join(" ")
    : values.companyName;
  const organizationType = isIndividual
    ? "Individual"
    : values.nonIndividualType === "Others"
      ? values.nonIndividualTypeOther
      : values.nonIndividualType;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-skyblue/25 bg-[radial-gradient(circle_at_88%_4%,rgba(87,196,229,0.35),transparent_38%),linear-gradient(145deg,#e1f5fc_0%,#f2fafc_60%,#edf8f2_100%)] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <CompanyLogo previewUrl={logoPreviewUrl} companyName={displayName} />

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
              {isIndividual ? "Individual workspace" : organizationType}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-darknavy">
              {displayName || "Your company"}
            </h2>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-darknavy/60">
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-700" />
                {values.companyEmail || "No email provided"}
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-sky-700" />
                {values.contactNumber || "No contact number"}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-700" />
                {values.address || "No address provided"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-darknavy/10 bg-offwhite/55 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-skyblue/15 text-sky-800">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-darknavy">Registration details</h3>
              <p className="mt-0.5 text-xs text-darknavy/45">
                Tax and organization information
              </p>
            </div>
          </div>
          <dl className="mt-4">
            <DetailRow
              label="Taxpayer type"
              value={isIndividual ? "Individual" : "Non-Individual"}
            />
            <DetailRow label="Organization type" value={organizationType} />
            <DetailRow label="TIN" value={values.tin} />
            <DetailRow label="Country" value={values.countryCode} />
            <DetailRow label="Base currency" value={values.baseCurrencyCode} />
            <DetailRow label="Website" value={values.website} />
          </dl>
        </section>

        <section className="rounded-2xl border border-darknavy/10 bg-offwhite/55 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-citron/30 text-darknavy">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-darknavy">Reporting period</h3>
              <p className="mt-0.5 text-xs text-darknavy/45">
                Your initial accounting year
              </p>
            </div>
          </div>
          <dl className="mt-4">
            <DetailRow
              label="Report starts"
              value={FormatOnboardingReportDateLabel(values.reportStartDate)}
            />
            <DetailRow
              label="Report ends"
              value={FormatOnboardingReportDateLabel(values.reportEndDate)}
            />
            <DetailRow
              label="Period"
              value={`${FormatOnboardingReportDateLabel(values.reportStartDate)} – ${FormatOnboardingReportDateLabel(values.reportEndDate)}`}
            />
          </dl>
        </section>
      </div>

      <div className="rounded-xl border border-citron/40 bg-citron/10 p-4 text-sm leading-6 text-darknavy/65">
        Review these details before creating your workspace. You can still go
        back and make changes.
      </div>

      <OnboardingActionRow
        showBack
        primaryLabel="Finish"
        isPending={isSubmitting}
        onPrimary={handleFinish}
        onBack={handleBack}
      />
    </div>
  );
}
