"use client";

import {
  DefaultPhilippineContactNumber,
  FormatPhilippineContactNumber,
  PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/contact/ContactData";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import { OnboardingNonIndividualTypeOptions } from "@/app/src/data/onboarding/OnboardingData";
import type {
  OnboardingFieldErrors,
  OnboardingTaxpayerType,
  OnboardingValues,
} from "@/app/src/data/onboarding/OnboardingTypes";
import { OnboardingActionRow } from "@/app/src/ui/onboarding/OnboardingActionRow";
import { OnboardingField } from "@/app/src/ui/onboarding/OnboardingField";
import { OnboardingFileField } from "@/app/src/ui/onboarding/OnboardingFileField";
import { OnboardingReportYearField } from "@/app/src/ui/onboarding/OnboardingReportYearField";
import { OnboardingSelectField } from "@/app/src/ui/onboarding/OnboardingSelectField";

type OnboardingStepOneProps = {
  values: OnboardingValues;
  errors: OnboardingFieldErrors;
  logoInputKey: number;
  logoPreviewUrl: string;
  isSubmitting: boolean;
  updateValue: (key: keyof OnboardingValues, value: string) => void;
  setTaxpayerType: (type: OnboardingTaxpayerType) => void;
  handleLogoChange: (file: File | undefined) => void;
  handleLogoRemove: () => void;
  handleBack: () => void;
  handleNext: () => void;
};

export function OnboardingStepOne({
  values,
  errors,
  logoInputKey,
  logoPreviewUrl,
  isSubmitting,
  updateValue,
  setTaxpayerType,
  handleLogoChange,
  handleLogoRemove,
  handleBack,
  handleNext,
}: OnboardingStepOneProps) {
  const isIndividual = values.taxpayerType === "individual";
  const isOtherOrganizationType = values.nonIndividualType === "Others";

  return (
    <div className="space-y-8">
      {/* Taxpayer Type Toggle */}
      <section>
        <p className="mb-3 block text-sm font-semibold text-darknavy">
          Taxpayer Type
        </p>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-darknavy/10 p-1.5">
          <button
            type="button"
            onClick={() => setTaxpayerType("individual")}
            className={`rounded-lg py-3 text-sm font-semibold transition ${isIndividual
              ? "bg-darknavy text-white shadow-sm"
              : "text-darknavy/55 hover:bg-offwhite hover:text-darknavy"
              }`}
          >
            Individual
          </button>
          <button
            type="button"
            onClick={() => setTaxpayerType("non-individual")}
            className={`rounded-lg py-3 text-sm font-semibold transition ${!isIndividual
              ? "bg-darknavy text-white shadow-sm"
              : "text-darknavy/55 hover:bg-offwhite hover:text-darknavy"
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
      </section>

      {/* Individual Fields */}
      {isIndividual ? (
        <div className="grid gap-5 md:grid-cols-3">
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
        <div className="space-y-5">
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
          <div
            className={`grid gap-5 ${
              isOtherOrganizationType ? "md:grid-cols-2" : "md:grid-cols-1"
            }`}
          >
            <OnboardingSelectField
              id="nonIndividualType"
              name="nonIndividualType"
              label="Organization Type"
              value={values.nonIndividualType}
              options={OnboardingNonIndividualTypeOptions}
              errors={errors.nonIndividualType}
              onChange={(value) => updateValue("nonIndividualType", value)}
            />
            {isOtherOrganizationType && (
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
      <div className="border-t border-darknavy/10 pt-8">
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
      </div>

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

      {/* TIN + Company Email + Contact Number */}
      <div className="grid gap-5 lg:grid-cols-3">
        <OnboardingField
          label="Company Email"
          id="companyEmail"
          name="companyEmail"
          type="email"
          placeholder="hello@acmecorp.com"
          value={values.companyEmail}
          onChange={(e) => updateValue("companyEmail", e.target.value)}
          errors={errors.companyEmail}
        />
        <OnboardingField
          label="Contact Number"
          id="contactNumber"
          name="contactNumber"
          type="tel"
          inputMode="numeric"
          placeholder={PhilippineContactNumberPlaceholder}
          maxLength={16}
          value={values.contactNumber}
          onChange={(e) =>
            updateValue(
              "contactNumber",
              FormatPhilippineContactNumber(e.target.value),
            )
          }
          onFocus={(e) => {
            if (!e.target.value) {
              updateValue("contactNumber", DefaultPhilippineContactNumber);
            }
          }}
          errors={errors.contactNumber}
        />
        <OnboardingField
          label="TIN"
          id="tin"
          name="tin"
          type="text"
          inputMode="numeric"
          placeholder="123-456-789-000"
          maxLength={15}
          value={values.tin}
          onChange={(e) => updateValue("tin", FormatTinNumber(e.target.value))}
          errors={errors.tin}
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
        showBack
        primaryLabel="Continue"
        isPending={isSubmitting}
        onPrimary={handleNext}
        onBack={handleBack}
      />
    </div>
  );
}
