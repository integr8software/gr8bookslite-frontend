"use client";

import { ApiClient } from "@/app/src/services/shared/ApiClient";
import type {
  CompleteOnboardingResponse,
  GetOnboardingDraftResponse,
  SaveOnboardingBillingRequest,
  SaveOnboardingCompanyDetailsRequest,
  SelectOnboardingPlanRequest,
} from "./OnboardingApiTypes";

function GetAuthorizationHeaders(accessToken: string | null) {
  if (!accessToken) {
    throw new Error("Your session has expired. Please sign in again.");
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
  await ApiClient.post("/onboarding/billing", body, {
    headers: GetAuthorizationHeaders(accessToken),
  });
}

export async function SaveOnboardingCompanyDetails(
  accessToken: string | null,
  body: SaveOnboardingCompanyDetailsRequest,
) {
  await ApiClient.post("/onboarding/company-details", body, {
    headers: GetAuthorizationHeaders(accessToken),
  });
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
