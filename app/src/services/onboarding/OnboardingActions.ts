"use server";

import { OnboardingStepOneSchema } from "@/app/src/data/onboarding/OnboardingSchemas";
import type {
  OnboardingActionState,
  OnboardingFieldErrors,
} from "@/app/src/data/onboarding/OnboardingTypes";

function GetFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function GetFileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File ? value : undefined;
}

function InvalidState(errors: OnboardingFieldErrors): OnboardingActionState {
  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    errors,
  };
}

export async function OnboardingStepOneAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const taxpayerType = GetFormValue(formData, "taxpayerType");
  const reportStartDate = GetFormValue(formData, "reportStartDate");
  const reportEndDate = GetFormValue(formData, "reportEndDate");

  const sharedFields = {
    address: GetFormValue(formData, "address"),
    tin: GetFormValue(formData, "tin"),
    website: GetFormValue(formData, "website"),
    contactNumber: GetFormValue(formData, "contactNumber"),
    logo: GetFileValue(formData, "logo"),
    reportYearBasis: "Calendar Year" as const,
    reportStartDate,
    reportEndDate,
  };

  const payload =
    taxpayerType === "individual"
      ? {
          taxpayerType: "individual" as const,
          lastName: GetFormValue(formData, "lastName"),
          firstName: GetFormValue(formData, "firstName"),
          middleName: GetFormValue(formData, "middleName"),
          ...sharedFields,
        }
      : {
          taxpayerType: "non-individual" as const,
          companyName: GetFormValue(formData, "companyName"),
          nonIndividualType: GetFormValue(formData, "nonIndividualType"),
          nonIndividualTypeOther: GetFormValue(
            formData,
            "nonIndividualTypeOther",
          ),
          ...sharedFields,
        };

  const parsed = OnboardingStepOneSchema.safeParse(payload);

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  return {
    status: "success",
    message: "Company details validated.",
  };
}
