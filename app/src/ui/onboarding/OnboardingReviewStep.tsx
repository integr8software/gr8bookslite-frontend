"use client";

import { FormatOnboardingReportDateLabel } from "@/app/src/data/onboarding/OnboardingData";
import type { OnboardingValues } from "@/app/src/data/onboarding/OnboardingTypes";
import { OnboardingActionRow } from "./OnboardingActionRow";

type OnboardingReviewStepProps = {
  values: OnboardingValues;
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

export function OnboardingReviewStep({
  values,
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
        <div className="mt-4 grid gap-4 md:grid-cols-2">
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

          <ReviewRow label="Logo" value={values.logoName} />
          <ReviewRow label="Address" value={values.address} />
          <ReviewRow label="TIN" value={values.tin} />
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
        onPrimary={handleFinish}
        onBack={handleBack}
      />
    </div>
  );
}
