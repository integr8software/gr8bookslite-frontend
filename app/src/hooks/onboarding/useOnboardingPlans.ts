"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { PricingPlan } from "@/app/src/data/pricing/PricingTypes";
import { GetOnboardingPlans } from "@/app/src/services/onboarding/OnboardingApi";
import { MapOnboardingPlanToPricingPlan } from "@/app/src/services/onboarding/OnboardingPlanMapper";

type UseOnboardingPlansParams = {
  accessToken: string | null;
};

export function useOnboardingPlans({ accessToken }: UseOnboardingPlansParams) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
        if (!isActive) {
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
  }, [accessToken]);

  return {
    plans,
    isPlansLoading: isLoading,
  };
}
