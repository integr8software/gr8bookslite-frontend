"use client";

import { useQuery } from "@tanstack/react-query";
import { GetCurrentBillingSubscription } from "@/app/src/services/billing/BillingApi";
import { BillingQueryKeys } from "@/app/src/services/billing/BillingQueryKeys";

type UseCurrentBillingSubscriptionQueryParams = {
  accessToken: string | null;
};

export function useCurrentBillingSubscriptionQuery({
  accessToken,
}: UseCurrentBillingSubscriptionQueryParams) {
  return useQuery({
    queryKey: BillingQueryKeys.currentSubscription(),
    queryFn: async () => GetCurrentBillingSubscription(accessToken as string),
    enabled: Boolean(accessToken),
  });
}
