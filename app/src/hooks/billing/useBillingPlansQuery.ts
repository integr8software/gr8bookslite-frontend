"use client";

import { useQuery } from "@tanstack/react-query";
import type { BillingPlanScope } from "@/app/src/data/billing/BillingTypes";
import { GetBillingPlans } from "@/app/src/services/billing/BillingApi";
import { BillingQueryKeys } from "@/app/src/services/billing/BillingQueryKeys";

type UseBillingPlansQueryParams = {
  accessToken: string | null;
  scope?: BillingPlanScope;
};

export function useBillingPlansQuery({
  accessToken,
  scope,
}: UseBillingPlansQueryParams) {
  return useQuery({
    queryKey: BillingQueryKeys.plans(scope),
    queryFn: async () => GetBillingPlans(scope),
    enabled: Boolean(accessToken),
  });
}
