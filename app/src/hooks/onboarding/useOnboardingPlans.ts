"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { PricingPlan } from "@/app/src/types/pricing/PricingTypes";
import { GetOnboardingPlans } from "@/app/src/services/onboarding/OnboardingApi";
import { MapOnboardingPlanToPricingPlan } from "@/app/src/services/onboarding/OnboardingPlanMapper";
import { IsIntentionalLogoutInProgress } from "@/app/src/services/auth/AuthSessionExpired";

type UseOnboardingPlansParams = {
  accessToken: string | null;
  isAuthSessionReady: boolean;
};

export function useOnboardingPlans({
  accessToken,
  isAuthSessionReady,
}: UseOnboardingPlansParams) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canLoadPlans = isAuthSessionReady && Boolean(accessToken);

  useEffect(() => {
    if (!canLoadPlans) {
      return;
    }

    let isActive = true;

    async function loadPlans() {
      setIsLoading(true);

      try {
        const response = await GetOnboardingPlans(accessToken);

        if (!isActive) {
          return;
        }

        setPlans(response.plans.map(MapOnboardingPlanToPricingPlan));
      } catch (error) {
        if (!isActive || IsIntentionalLogoutInProgress()) {
          return;
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "We could not load subscription plans right now.",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPlans();

    return () => {
      isActive = false;
    };
  }, [accessToken, canLoadPlans]);

  return {
    plans,
    isPlansLoading: canLoadPlans ? isLoading : !isAuthSessionReady,
  };
}
