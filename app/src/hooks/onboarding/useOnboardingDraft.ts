"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { OnboardingValues } from "@/app/src/data/onboarding/OnboardingTypes";
import { PricingPlans, type BillingCycle, type PricingPlan } from "@/app/src/data/pricing/PricingData";
import { GetOnboardingDraft } from "@/app/src/services/onboarding/OnboardingApi";
import type { OnboardingDraft } from "@/app/src/services/onboarding/OnboardingApiTypes";

function Wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
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

  if (draft.hasBillingSetup) {
    return 3;
  }

  if (draft.hasCompanyDetails) {
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
  setPersistedLogoPreviewUrl: (value: string) => void;
};

export function useOnboardingDraft({
  accessToken,
  setSelectedPlan,
  setSelectedBillingCycle,
  setStepIndex,
  setValues,
  setPersistedLogoPreviewUrl,
}: UseOnboardingDraftParams) {
  const [hasMounted, setHasMounted] = useState(false);
  const resolvedAccessToken = accessToken;
  const [hasResolvedDraft, setHasResolvedDraft] = useState(false);
  const isDraftLoading = !hasMounted || !hasResolvedDraft;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHasMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!hasMounted || hasResolvedDraft) {
      return;
    }

    let isActive = true;

    async function loadDraft() {
      try {
        let draft: OnboardingDraft | null = null;

        for (let attempt = 0; attempt < 3; attempt += 1) {
          const response = await GetOnboardingDraft(resolvedAccessToken);
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
        setPersistedLogoPreviewUrl(draftCompanyDetails.logoPublicUrl ?? "");
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
          logoStoragePath: draftCompanyDetails.logoStoragePath ?? "",
          logoPublicUrl: draftCompanyDetails.logoPublicUrl ?? "",
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
    hasMounted,
    hasResolvedDraft,
    resolvedAccessToken,
    setSelectedBillingCycle,
    setSelectedPlan,
    setStepIndex,
    setPersistedLogoPreviewUrl,
    setValues,
  ]);

  return {
    resolvedAccessToken,
    isDraftLoading,
  };
}
