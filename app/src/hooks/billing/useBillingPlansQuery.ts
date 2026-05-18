"use client";

import { useQuery } from "@tanstack/react-query";
import { GetBillingPlans } from "@/app/src/services/billing/BillingApi";
import { BillingQueryKeys } from "@/app/src/services/billing/BillingQueryKeys";

type UseBillingPlansQueryParams = {
  accessToken: string | null;
};

export function useBillingPlansQuery({
  accessToken,
}: UseBillingPlansQueryParams) {
  return useQuery({
    queryKey: BillingQueryKeys.plans(),
    queryFn: async () => GetBillingPlans(accessToken as string),
    enabled: Boolean(accessToken),
  });
}
