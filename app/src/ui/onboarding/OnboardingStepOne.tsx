"use client";

import {
  OnboardingCompanySizeOptions,
  OnboardingIndustryOptions,
} from "@/app/src/data/onboarding/OnboardingData";
import type {
  OnboardingFieldErrors,
  OnboardingValues,
} from "@/app/src/data/onboarding/OnboardingTypes";
import { OnboardingActionRow } from "./OnboardingActionRow";
import { OnboardingField } from "./OnboardingField";
import { OnboardingFileField } from "./OnboardingFileField";
import { OnboardingSelectField } from "./OnboardingSelectField";

type OnboardingStepOneProps = {
  values: OnboardingValues;
  errors: OnboardingFieldErrors;
  attachmentInputKey: number;
  updateValue: (key: keyof OnboardingValues, value: string) => void;
  handleAttachmentChange: (file: File | undefined) => void;
  handleAttachmentRemove: () => void;
  handleNext: () => void;
};

export function OnboardingStepOne({
  values,
  errors,
  attachmentInputKey,
  updateValue,
  handleAttachmentChange,
  handleAttachmentRemove,
  handleNext,
}: OnboardingStepOneProps) {
  return (
    <div className="mt-10 space-y-6">
      <OnboardingField
        label="Company Name"
        id="companyName"
        name="companyName"
        type="text"
        placeholder="e.g. Acme Corp"
        value={values.companyName}
        onChange={(event) => updateValue("companyName", event.target.value)}
        errors={errors.companyName}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <OnboardingSelectField
          id="industry"
          name="industry"
          label="Industry"
          value={values.industry}
          options={OnboardingIndustryOptions}
          errors={errors.industry}
          onChange={(value) => updateValue("industry", value)}
        />

        <OnboardingSelectField
          id="companySize"
          name="companySize"
          label="Company Size"
          value={values.companySize}
          options={OnboardingCompanySizeOptions}
          errors={errors.companySize}
          onChange={(value) => updateValue("companySize", value)}
        />
      </div>

      <OnboardingField
        label="Company Website (Optional)"
        id="website"
        name="website"
        type="url"
        placeholder="https://acmecorp.com"
        value={values.website}
        onChange={(event) => updateValue("website", event.target.value)}
        errors={errors.website}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <OnboardingFileField
          id="attachment"
          name="attachment"
          label="Image attachment"
          fileName={values.attachmentName}
          hint="Employees signing up with this domain will be auto-verified."
          inputKey={attachmentInputKey}
          errors={errors.attachment}
          onChange={handleAttachmentChange}
          onRemove={handleAttachmentRemove}
        />

        <OnboardingField
          label="Contact Number"
          id="contactNumber"
          name="contactNumber"
          type="tel"
          placeholder="+1 (555) 012-3456"
          value={values.contactNumber}
          onChange={(event) => updateValue("contactNumber", event.target.value)}
          errors={errors.contactNumber}
        />
      </div>

      <OnboardingActionRow
        showBack={false}
        primaryLabel="Continue"
        onPrimary={handleNext}
        onBack={() => undefined}
      />
    </div>
  );
}
