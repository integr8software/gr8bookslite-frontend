"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { OnboardingValues } from "@/app/src/types/onboarding/OnboardingTypes";
import type { BillingCycle, PricingPlan } from "@/app/src/data/pricing/PricingTypes";
import type { GetOnboardingDraftResponseDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import { GetOnboardingDraft } from "@/app/src/services/onboarding/OnboardingApi";
import { MapOnboardingPlanToPricingPlan } from "@/app/src/services/onboarding/OnboardingPlanMapper";
import { IsIntentionalLogoutInProgress } from "@/app/src/services/auth/AuthSessionExpired";

type OnboardingDraft = NonNullable<GetOnboardingDraftResponseDto["draft"]>;

function Wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function GetUiBillingCycle(
  value: "MONTHLY" | "QUARTERLY" | "YEARLY" | null | undefined,
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

function GetDraftPlan(draft: OnboardingDraft | null) {
  return draft?.plan ? MapOnboardingPlanToPricingPlan(draft.plan) : null;
}

type UseOnboardingDraftParams = {
  accessToken: string | null;
  isAuthSessionReady: boolean;
  setSelectedPlan: React.Dispatch<React.SetStateAction<PricingPlan | null>>;
  setSelectedBillingCycle: React.Dispatch<React.SetStateAction<BillingCycle>>;
  setHasPersistedBillingSetup: React.Dispatch<React.SetStateAction<boolean>>;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  setValues: React.Dispatch<React.SetStateAction<OnboardingValues>>;
  markDraftCurrencySelectionAsExplicit: () => void;
  setPersistedLogoPreviewUrl: (value: string) => void;
};

export function useOnboardingDraft({
  accessToken,
  isAuthSessionReady,
  setSelectedPlan,
  setSelectedBillingCycle,
  setHasPersistedBillingSetup,
  setStepIndex,
  setValues,
  markDraftCurrencySelectionAsExplicit,
  setPersistedLogoPreviewUrl,
}: UseOnboardingDraftParams) {
  const [hasMounted, setHasMounted] = useState(false);
  const resolvedAccessToken = accessToken;
  const [hasResolvedDraft, setHasResolvedDraft] = useState(false);
  const canLoadDraft = isAuthSessionReady && Boolean(accessToken);
  const isDraftLoading =
    !hasMounted || !isAuthSessionReady || (canLoadDraft && !hasResolvedDraft);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHasMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!hasMounted || !canLoadDraft || hasResolvedDraft) {
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
        const selectedDraftPlan = GetDraftPlan(draft);

        if (draftCompanyDetails.baseCurrencyCode) {
          markDraftCurrencySelectionAsExplicit();
        }

        setSelectedPlan(selectedDraftPlan);
        setSelectedBillingCycle(GetUiBillingCycle(draft.billingCycle));
        setHasPersistedBillingSetup(draft.hasBillingSetup);
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
          countryCode: draftCompanyDetails.countryCode ?? current.countryCode,
          baseCurrencyCode:
            draftCompanyDetails.baseCurrencyCode ?? current.baseCurrencyCode,
          tin: draftCompanyDetails.tin ?? "",
          companyEmail: draftCompanyDetails.companyEmail ?? "",
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
          cardNumber: current.cardNumber,
          cvc: current.cvc,
        }));
      } catch (error) {
        if (!isActive || IsIntentionalLogoutInProgress()) {
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
    canLoadDraft,
    resolvedAccessToken,
    setSelectedBillingCycle,
    setHasPersistedBillingSetup,
    setSelectedPlan,
    setStepIndex,
    setPersistedLogoPreviewUrl,
    setValues,
    markDraftCurrencySelectionAsExplicit,
  ]);

  return {
    resolvedAccessToken,
    isDraftLoading,
  };
}
