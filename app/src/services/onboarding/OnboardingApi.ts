"use client";

import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  CompleteOnboardingResponse,
  GetOnboardingDraftResponse,
  SaveOnboardingBillingResponse,
  SaveOnboardingBillingRequest,
  SaveOnboardingCompanyDetailsRequest,
  SelectOnboardingPlanRequest,
  UploadOnboardingCompanyLogoResponse,
} from "@/app/src/services/onboarding/OnboardingApiTypes";

function GetAuthorizationHeaders(accessToken: string | null) {
  if (!accessToken) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function SelectOnboardingPlan(
  accessToken: string | null,
  body: SelectOnboardingPlanRequest,
) {
  await ApiClient.post("/onboarding/plan", body, {
    headers: GetAuthorizationHeaders(accessToken),
  });
}

export async function GetOnboardingDraft(accessToken: string | null) {
  const response = await ApiClient.get<GetOnboardingDraftResponse>(
    "/onboarding/draft",
    {
      headers: GetAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}

export async function SaveOnboardingBilling(
  accessToken: string | null,
  body: SaveOnboardingBillingRequest,
) {
  const response = await ApiClient.post<SaveOnboardingBillingResponse>(
    "/onboarding/billing",
    body,
    {
      headers: GetAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}

export async function SaveOnboardingCompanyDetails(
  accessToken: string | null,
  body: SaveOnboardingCompanyDetailsRequest,
) {
  await ApiClient.post("/onboarding/company-details", body, {
    headers: GetAuthorizationHeaders(accessToken),
  });
}

export async function UploadOnboardingCompanyLogo(
  accessToken: string | null,
  logoFile: File,
) {
  const formData = new FormData();
  formData.append("logo", logoFile);

  const response = await ApiClient.post<UploadOnboardingCompanyLogoResponse>(
    "/onboarding/company-logo",
    formData,
    {
      headers: {
        ...GetAuthorizationHeaders(accessToken),
        "Content-Type": undefined,
      },
    },
  );

  return response.data;
}

export async function CompleteOnboarding(accessToken: string | null) {
  const response = await ApiClient.post<CompleteOnboardingResponse>(
    "/onboarding/complete",
    {},
    {
      headers: GetAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}
