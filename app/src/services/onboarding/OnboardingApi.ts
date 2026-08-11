"use client";

import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import { IsClientAuthSessionMarker } from "@/app/src/data/auth/AuthSessionStorage";
import type {
  CompleteOnboardingResponseDto,
  GetOnboardingDraftResponseDto,
  OnboardingPlansResponseDto,
  SaveOnboardingBillingDto,
  SaveOnboardingBillingResponseDto,
  SaveOnboardingCompanyDetailsDto,
  SelectOnboardingPlanDto,
  UploadOnboardingCompanyLogoResponseDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";

const CompleteOnboardingTimeoutMs = 60000;

function GetAuthorizationHeaders(accessToken: string | null) {
  if (!accessToken || IsClientAuthSessionMarker(accessToken)) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function SelectOnboardingPlan(
  accessToken: string | null,
  body: SelectOnboardingPlanDto,
) {
  await ApiClient.post("/onboarding/plan", body, {
    headers: GetAuthorizationHeaders(accessToken),
  });
}

export async function GetOnboardingDraft(accessToken: string | null) {
  const response = await ApiClient.get<GetOnboardingDraftResponseDto>(
    "/onboarding/draft",
    {
      headers: GetAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}

export async function GetOnboardingPlans(accessToken: string | null) {
  const response = await ApiClient.get<OnboardingPlansResponseDto>(
    "/onboarding/plans",
    {
      headers: GetAuthorizationHeaders(accessToken),
    },
  );

  return response.data;
}

export async function SaveOnboardingBilling(
  accessToken: string | null,
  body: SaveOnboardingBillingDto,
) {
  const response = await ApiClient.post<SaveOnboardingBillingResponseDto>(
    "/onboarding/billing",
    body,
    {
      headers: GetAuthorizationHeaders(accessToken),
      timeout: 30000,
    },
  );

  return response.data;
}

export async function SaveOnboardingCompanyDetails(
  accessToken: string | null,
  body: SaveOnboardingCompanyDetailsDto,
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

  const response = await ApiClient.post<UploadOnboardingCompanyLogoResponseDto>(
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
  const response = await ApiClient.post<CompleteOnboardingResponseDto>(
    "/onboarding/complete",
    {},
    {
      headers: GetAuthorizationHeaders(accessToken),
      timeout: CompleteOnboardingTimeoutMs,
    },
  );

  return response.data;
}
