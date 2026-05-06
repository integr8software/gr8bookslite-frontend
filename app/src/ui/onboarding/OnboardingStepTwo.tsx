"use client";

import { OnboardingDepartmentOptions } from "@/app/src/data/onboarding/OnboardingData";
import type {
  OnboardingFieldErrors,
  OnboardingValues,
} from "@/app/src/data/onboarding/OnboardingTypes";
import { OnboardingActionRow } from "./OnboardingActionRow";
import { OnboardingField } from "./OnboardingField";
import { OnboardingPasswordStrength } from "./OnboardingPasswordStrength";
import { OnboardingPasswordRequirements } from "./OnboardingPasswordRequirements";
import { OnboardingSelectField } from "./OnboardingSelectField";

type OnboardingStepTwoProps = {
  values: OnboardingValues;
  errors: OnboardingFieldErrors;
  passwordStrength: number;
  updateValue: (key: keyof OnboardingValues, value: string) => void;
  handleNext: () => void;
  handleBack: () => void;
};

export function OnboardingStepTwo({
  values,
  errors,
  passwordStrength,
  updateValue,
  handleNext,
  handleBack,
}: OnboardingStepTwoProps) {
  return (
    <div className="mt-10 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <OnboardingField
          label="First Name"
          id="firstName"
          name="firstName"
          type="text"
          placeholder="John"
          value={values.firstName}
          onChange={(event) => updateValue("firstName", event.target.value)}
          errors={errors.firstName}
        />

        <OnboardingField
          label="Last Name"
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Doe"
          value={values.lastName}
          onChange={(event) => updateValue("lastName", event.target.value)}
          errors={errors.lastName}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <OnboardingField
          label="Work Email"
          id="workEmail"
          name="workEmail"
          type="email"
          placeholder="johndoe@gmail.com"
          value={values.workEmail}
          onChange={(event) => updateValue("workEmail", event.target.value)}
          errors={errors.workEmail}
        />

        <OnboardingSelectField
          id="department"
          name="department"
          label="Department"
          value={values.department}
          options={OnboardingDepartmentOptions}
          errors={errors.department}
          onChange={(value) => updateValue("department", value)}
        />
      </div>

      <div>
        <OnboardingField
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="Min. 8 Characters"
          value={values.password}
          onChange={(event) => updateValue("password", event.target.value)}
          errors={errors.password}
        />
        <OnboardingPasswordStrength strength={passwordStrength} />
        <OnboardingPasswordRequirements password={values.password} />
      </div>

      <OnboardingField
        label="Confirm Password"
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        placeholder="Re-enter password"
        value={values.confirmPassword}
        onChange={(event) => updateValue("confirmPassword", event.target.value)}
        errors={errors.confirmPassword}
      />

      <OnboardingActionRow
        showBack
        primaryLabel="Continue"
        onPrimary={handleNext}
        onBack={handleBack}
      />
    </div>
  );
}
