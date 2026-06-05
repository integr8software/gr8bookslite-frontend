"use client";

import { useQuery } from "@tanstack/react-query";
import type { BillingPlanScope } from "@/app/src/data/billing/BillingTypes";
import { GetBillingSubscriptionSetup } from "@/app/src/services/billing/BillingApi";
import { BillingQueryKeys } from "@/app/src/services/billing/BillingQueryKeys";
import { CreateSessionQueryOptions } from "@/app/src/services/shared/query/QueryProfiles";

type UseBillingSubscriptionSetupQueryParams = {
  accessToken: string | null;
  scope?: BillingPlanScope;
};

export function useBillingSubscriptionSetupQuery({
  accessToken,
  scope,
}: UseBillingSubscriptionSetupQueryParams) {
  return useQuery({
    ...CreateSessionQueryOptions(
      BillingQueryKeys.subscriptionSetup(scope),
      async () => GetBillingSubscriptionSetup(scope),
    ),
    enabled: Boolean(accessToken),
  });
}
