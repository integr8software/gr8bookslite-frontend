"use client";
import { FormatOnboardingReportDateLabel } from "@/app/src/data/onboarding/OnboardingData";
import type { OnboardingValues } from "@/app/src/data/onboarding/OnboardingTypes";
import { OnboardingActionRow } from "@/app/src/ui/onboarding/OnboardingActionRow";

type OnboardingReviewStepProps = {
  values: OnboardingValues;
  logoPreviewUrl: string;
  isSubmitting: boolean;
  handleBack: () => void;
  handleFinish: () => void;
};

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-darknavy/10 bg-offwhite px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-darknavy/50">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-darknavy">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function ReviewLogoRow({
  label,
  previewUrl,
  fileName,
}: {
  label: string;
  previewUrl: string;
  fileName: string;
}) {
  return (
    <div className="rounded-md border border-darknavy/10 bg-offwhite px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-darknavy/50">
        {label}
      </p>
      {previewUrl ? (
        <div className="mt-3 flex items-center gap-4">
          {/* User-uploaded preview URLs can be blob or backend-hosted values that don't work reliably with next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={fileName ? `${fileName} logo preview` : "Uploaded logo preview"}
            width={160}
            height={80}
            loading="lazy"
            className="h-20 w-auto rounded-md border border-darknavy/10 bg-white object-contain p-2"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-darknavy">Uploaded logo</p>
            <p className="mt-1 text-xs text-darknavy/55">
              This logo will appear on your company profile.
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-sm font-medium text-darknavy">Not provided</p>
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

  return (
    <div className="mt-10 space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-darknavy">
          {isIndividual ? "Individual Details" : "Company Details"}
        </h2>
        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <ReviewRow
            label="Taxpayer Type"
            value={isIndividual ? "Individual" : "Non-Individual"}
          />

          {isIndividual ? (
            <>
              <ReviewRow label="Last Name" value={values.lastName} />
              <ReviewRow label="First Name" value={values.firstName} />
              <ReviewRow label="Middle Name" value={values.middleName} />
            </>
          ) : (
            <>
              <ReviewRow label="Company Name" value={values.companyName} />
              <ReviewRow
                label="Organization Type"
                value={
                  values.nonIndividualType === "Others"
                    ? values.nonIndividualTypeOther
                    : values.nonIndividualType
                }
              />
            </>
          )}

          <ReviewLogoRow
            label="Logo"
            previewUrl={logoPreviewUrl}
            fileName={values.logoName}
          />
          <ReviewRow label="Address" value={values.address} />
          <ReviewRow label="TIN" value={values.tin} />
          <ReviewRow label="Company Email" value={values.companyEmail} />
          <ReviewRow label="Contact Number" value={values.contactNumber} />
          <ReviewRow label="Website" value={values.website} />
          <ReviewRow
            label="Report Start"
            value={FormatOnboardingReportDateLabel(values.reportStartDate)}
          />
          <ReviewRow
            label="Report End"
            value={FormatOnboardingReportDateLabel(values.reportEndDate)}
          />
        </div>
      </section>
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
