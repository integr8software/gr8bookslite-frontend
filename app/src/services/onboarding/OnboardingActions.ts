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
  const parsed = OnboardingStepOneSchema.safeParse({
    companyName: GetFormValue(formData, "companyName"),
    industry: GetFormValue(formData, "industry"),
    companySize: GetFormValue(formData, "companySize"),
    website: GetFormValue(formData, "website"),
    contactNumber: GetFormValue(formData, "contactNumber"),
    attachment: GetFileValue(formData, "attachment"),
  });

  if (!parsed.success) {
    return InvalidState(parsed.error.flatten().fieldErrors);
  }

  return {
    status: "success",
    message: "Company details validated. Step 2 can be connected next.",
  };
}
