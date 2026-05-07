"use client";

import { OnboardingNonIndividualTypeOptions } from "@/app/src/data/onboarding/OnboardingData";
import type {
  OnboardingFieldErrors,
  OnboardingTaxpayerType,
  OnboardingValues,
} from "@/app/src/data/onboarding/OnboardingTypes";
import { OnboardingActionRow } from "./OnboardingActionRow";
import { OnboardingField } from "./OnboardingField";
import { OnboardingFileField } from "./OnboardingFileField";
import { OnboardingReportYearField } from "./OnboardingReportYearField";
import { OnboardingSelectField } from "./OnboardingSelectField";

type OnboardingStepOneProps = {
  values: OnboardingValues;
  errors: OnboardingFieldErrors;
  logoInputKey: number;
  logoPreviewUrl: string;
  updateValue: (key: keyof OnboardingValues, value: string) => void;
  setTaxpayerType: (type: OnboardingTaxpayerType) => void;
  handleLogoChange: (file: File | undefined) => void;
  handleLogoRemove: () => void;
  handleNext: () => void;
};

export function OnboardingStepOne({
  values,
  errors,
  logoInputKey,
  logoPreviewUrl,
  updateValue,
  setTaxpayerType,
  handleLogoChange,
  handleLogoRemove,
  handleNext,
}: OnboardingStepOneProps) {
  const isIndividual = values.taxpayerType === "individual";

  return (
    <div className="mt-10 space-y-6">
      {/* Taxpayer Type Toggle */}
      <div>
        <p className="mb-2 block text-sm font-medium text-darknavy">
          Taxpayer Type
        </p>
        <div className="flex overflow-hidden rounded-md border border-darknavy/20">
          <button
            type="button"
            onClick={() => setTaxpayerType("individual")}
            className={`flex-1 py-3 text-sm font-semibold transition ${isIndividual
              ? "bg-black text-white"
              : "bg-white text-darknavy hover:bg-offwhite"
              }`}
          >
            Individual
          </button>
          <button
            type="button"
            onClick={() => setTaxpayerType("non-individual")}
            className={`flex-1 border-l border-darknavy/20 py-3 text-sm font-semibold transition ${!isIndividual
              ? "bg-black text-white"
              : "bg-white text-darknavy hover:bg-offwhite"
              }`}
          >
            Non-Individual
          </button>
        </div>
        {!isIndividual && (
          <p className="mt-2 text-xs text-darknavy/60">
            Partnership, Corporation, Association, Non Stock, Non Profit
            Organization, Others
          </p>
        )}
      </div>

      {/* Individual Fields */}
      {isIndividual ? (
        <div className="grid gap-6 md:grid-cols-3">
          <OnboardingField
            label="Last Name"
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            value={values.lastName}
            onChange={(e) => updateValue("lastName", e.target.value)}
            errors={errors.lastName}
          />
          <OnboardingField
            label="First Name"
            id="firstName"
            name="firstName"
            type="text"
            placeholder="John"
            value={values.firstName}
            onChange={(e) => updateValue("firstName", e.target.value)}
            errors={errors.firstName}
          />
          <OnboardingField
            label="Middle Name"
            id="middleName"
            name="middleName"
            type="text"
            placeholder="Santos"
            value={values.middleName}
            onChange={(e) => updateValue("middleName", e.target.value)}
            errors={errors.middleName}
          />
        </div>
      ) : (
        /* Non-Individual Fields */
        <div className="space-y-6">
          <OnboardingField
            label="Company / Organization Name"
            id="companyName"
            name="companyName"
            type="text"
            placeholder="e.g. Acme Corp"
            value={values.companyName}
            onChange={(e) => updateValue("companyName", e.target.value)}
            errors={errors.companyName}
          />
          <div className="grid gap-6 md:grid-cols-2">
            <OnboardingSelectField
              id="nonIndividualType"
              name="nonIndividualType"
              label="Organization Type"
              value={values.nonIndividualType}
              options={OnboardingNonIndividualTypeOptions}
              errors={errors.nonIndividualType}
              onChange={(value) => updateValue("nonIndividualType", value)}
            />
            {values.nonIndividualType === "Others" && (
              <OnboardingField
                label="Please Specify"
                id="nonIndividualTypeOther"
                name="nonIndividualTypeOther"
                type="text"
                placeholder="Specify organization type"
                value={values.nonIndividualTypeOther}
                onChange={(e) =>
                  updateValue("nonIndividualTypeOther", e.target.value)
                }
                errors={errors.nonIndividualTypeOther}
              />
            )}
          </div>
        </div>
      )}

      {/* Logo */}
      <OnboardingFileField
        id="logo"
        name="logo"
        label="Logo"
        fileName={values.logoName}
        previewUrl={logoPreviewUrl}
        hint="Upload your company or personal logo. Max 5MB."
        inputKey={logoInputKey}
        errors={errors.logo}
        onChange={handleLogoChange}
        onRemove={handleLogoRemove}
      />

      {/* Address */}
      <OnboardingField
        label="Address"
        id="address"
        name="address"
        type="text"
        placeholder="123 Main St, City, Province"
        value={values.address}
        onChange={(e) => updateValue("address", e.target.value)}
        errors={errors.address}
      />

      {/* TIN + Contact Number */}
      <div className="grid gap-6 md:grid-cols-2">
        <OnboardingField
          label="TIN"
          id="tin"
          name="tin"
          type="text"
          inputMode="numeric"
          placeholder="123-456-789-000"
          maxLength={15}
          value={values.tin}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
            const formatted = digits.replace(/(\d{3})(?=\d)/g, "$1-");
            updateValue("tin", formatted);
          }}
          errors={errors.tin}
        />
        <OnboardingField
          label="Contact Number"
          id="contactNumber"
          name="contactNumber"
          type="tel"
          inputMode="numeric"
          placeholder="+63 917 123 4567"
          maxLength={16}
          value={values.contactNumber}
          onChange={(e) => {
            const prefix = "+63 ";
            const digits = e.target.value
              .replace(/^\+63\s?/, "")
              .replace(/\D/g, "")
              .slice(0, 10);
            let formatted = "";
            if (digits.length <= 3) {
              formatted = digits;
            } else if (digits.length <= 6) {
              formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
            } else {
              formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
            }
            updateValue(
              "contactNumber",
              digits ? `${prefix}${formatted}` : prefix,
            );
          }}
          onFocus={(e) => {
            if (!e.target.value) updateValue("contactNumber", "+63 ");
          }}
          errors={errors.contactNumber}
        />
      </div>

      <OnboardingReportYearField
        basis={values.reportYearBasis}
        startDate={values.reportStartDate}
        endDate={values.reportEndDate}
        errors={errors}
        onStartDateChange={(value) => updateValue("reportStartDate", value)}
        onEndDateChange={(value) => updateValue("reportEndDate", value)}
      />

      {/* Website (Optional) */}
      <OnboardingField
        label="Company Website (Optional)"
        id="website"
        name="website"
        type="url"
        placeholder="https://acmecorp.com"
        value={values.website}
        onChange={(e) => updateValue("website", e.target.value)}
        errors={errors.website}
      />

      <OnboardingActionRow
        showBack={false}
        primaryLabel="Continue"
        onPrimary={handleNext}
        onBack={() => undefined}
      />
    </div>
  );
}
