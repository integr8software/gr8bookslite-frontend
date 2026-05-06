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
          id="accountFirstName"
          name="accountFirstName"
          type="text"
          placeholder="John"
          value={values.accountFirstName}
          onChange={(e) => updateValue("accountFirstName", e.target.value)}
          errors={errors.accountFirstName}
        />
        <OnboardingField
          label="Last Name"
          id="accountLastName"
          name="accountLastName"
          type="text"
          placeholder="Doe"
          value={values.accountLastName}
          onChange={(e) => updateValue("accountLastName", e.target.value)}
          errors={errors.accountLastName}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <OnboardingField
          label="Work Email"
          id="workEmail"
          name="workEmail"
          type="email"
          placeholder="johndoe@company.com"
          value={values.workEmail}
          onChange={(e) => updateValue("workEmail", e.target.value)}
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
          onChange={(e) => updateValue("password", e.target.value)}
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
        onChange={(e) => updateValue("confirmPassword", e.target.value)}
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
