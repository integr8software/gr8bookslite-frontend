"use client";

import type { OnboardingValues } from "@/app/src/data/onboarding/OnboardingTypes";
import { OnboardingActionRow } from "./OnboardingActionRow";

type OnboardingReviewStepProps = {
  values: OnboardingValues;
  handleBack: () => void;
  handleFinish: () => void;
};

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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
  return (
    <div className="mt-10 space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-darknavy">Company Details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ReviewRow label="Company Name" value={values.companyName} />
          <ReviewRow label="Industry" value={values.industry} />
          <ReviewRow label="Company Size" value={values.companySize} />
          <ReviewRow label="Website" value={values.website} />
          <ReviewRow label="Contact Number" value={values.contactNumber} />
          <ReviewRow label="Attachment" value={values.attachmentName} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-darknavy">Account Details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ReviewRow label="First Name" value={values.firstName} />
          <ReviewRow label="Last Name" value={values.lastName} />
          <ReviewRow label="Work Email" value={values.workEmail} />
          <ReviewRow label="Department" value={values.department} />
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
