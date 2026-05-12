"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import type { OnboardingValues } from "@/app/src/data/onboarding/OnboardingTypes";
import { PricingPlans, type BillingCycle, type PricingPlan } from "@/app/src/data/pricing/PricingData";
import { GetOnboardingDraft } from "@/app/src/services/onboarding/OnboardingApi";
import type { OnboardingDraft } from "@/app/src/services/onboarding/OnboardingApiTypes";

function Wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

async function WaitForAccessToken() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = GetAccessToken();

    if (token) {
      return token;
    }

    await Wait(200);
  }

  return null;
}

function GetUiBillingCycle(
  value: "MONTHLY" | "YEARLY" | null | undefined,
): BillingCycle {
  return value === "YEARLY" ? "yearly" : "monthly";
}

function GetDraftStepIndex(draft: OnboardingDraft | null) {
  if (!draft?.plan) {
    return 0;
  }

  if (draft.hasCompanyDetails) {
    return 3;
  }

  if (draft.hasBillingSetup) {
    return 2;
  }

  return 1;
}

function GetDraftPlan(planCode: string | null | undefined) {
  if (!planCode) {
    return null;
  }

  return PricingPlans.find((plan) => plan.code === planCode) ?? null;
}

type UseOnboardingDraftParams = {
  accessToken: string | null;
  setSelectedPlan: React.Dispatch<React.SetStateAction<PricingPlan | null>>;
  setSelectedBillingCycle: React.Dispatch<React.SetStateAction<BillingCycle>>;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  setValues: React.Dispatch<React.SetStateAction<OnboardingValues>>;
};

export function useOnboardingDraft({
  accessToken,
  setSelectedPlan,
  setSelectedBillingCycle,
  setStepIndex,
  setValues,
}: UseOnboardingDraftParams) {
  const [browserAccessToken, setBrowserAccessToken] = useState<
    string | null | undefined
  >(undefined);
  const hasMounted = browserAccessToken !== undefined;
  const resolvedAccessToken = accessToken ?? browserAccessToken ?? null;
  const [hasResolvedDraft, setHasResolvedDraft] = useState(false);
  const isDraftLoading =
    !hasMounted || (Boolean(resolvedAccessToken) && !hasResolvedDraft);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setBrowserAccessToken(GetAccessToken());
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!resolvedAccessToken || hasResolvedDraft) {
      return;
    }

    let isActive = true;

    async function loadDraft() {
      try {
        const token = resolvedAccessToken ?? (await WaitForAccessToken());

        if (!token) {
          return;
        }

        let draft: OnboardingDraft | null = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
          const response = await GetOnboardingDraft(token);
          draft = response.draft;

          if (draft) {
            break;
          }

          if (attempt < 2) {
            await Wait(350);
          }
        }

        if (!isActive || !draft) {
          return;
        }

        const draftCompanyDetails = draft.companyDetails;
        const selectedDraftPlan = GetDraftPlan(draft.plan?.code);

        setSelectedPlan(selectedDraftPlan);
        setSelectedBillingCycle(GetUiBillingCycle(draft.billingCycle));
        setStepIndex(GetDraftStepIndex(draft));
        setValues((current) => ({
          ...current,
          taxpayerType:
            draftCompanyDetails.taxpayerType ?? current.taxpayerType,
          lastName: draftCompanyDetails.lastName ?? "",
          firstName: draftCompanyDetails.firstName ?? "",
          middleName: draftCompanyDetails.middleName ?? "",
          companyName: draftCompanyDetails.companyName ?? "",
          nonIndividualType: draftCompanyDetails.nonIndividualType ?? "",
          nonIndividualTypeOther:
            draftCompanyDetails.nonIndividualTypeOther ?? "",
          address: draftCompanyDetails.address ?? "",
          tin: draftCompanyDetails.tin ?? "",
          website: draftCompanyDetails.website ?? "",
          contactNumber:
            draftCompanyDetails.contactNumber ?? current.contactNumber,
          logoName: draftCompanyDetails.logoName ?? "",
          logoFile: null,
          reportStartDate:
            draftCompanyDetails.reportStartDate ?? current.reportStartDate,
          reportEndDate:
            draftCompanyDetails.reportEndDate ?? current.reportEndDate,
          cardholderName: draft.cardholderName ?? "",
          billingEmail: draft.billingEmail ?? "",
          expiryMonth: draft.cardExpiryMonth
            ? String(draft.cardExpiryMonth).padStart(2, "0")
            : "",
          expiryYear: draft.cardExpiryYear ? String(draft.cardExpiryYear) : "",
          billingAddress: draft.billingAddress ?? "",
          cardNumber: "",
          cvc: "",
        }));
      } catch (error) {
        if (!isActive) {
          return;
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "We could not load your onboarding draft right now.",
        );
      } finally {
        if (isActive) {
          setHasResolvedDraft(true);
        }
      }
    }

    void loadDraft();

    return () => {
      isActive = false;
    };
  }, [
    hasResolvedDraft,
    resolvedAccessToken,
    setSelectedBillingCycle,
    setSelectedPlan,
    setStepIndex,
    setValues,
  ]);

  return {
    resolvedAccessToken,
    isDraftLoading,
  };
}
