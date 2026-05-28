"use client";

import { useQuery } from "@tanstack/react-query";
import { GetBillingPaymentMethods } from "@/app/src/services/billing/BillingApi";
import { BillingQueryKeys } from "@/app/src/services/billing/BillingQueryKeys";

type UseBillingPaymentMethodsQueryParams = {
	accessToken: string | null;
};

export function useBillingPaymentMethodsQuery({
	accessToken,
}: UseBillingPaymentMethodsQueryParams) {
	return useQuery({
		queryKey: BillingQueryKeys.paymentMethods(),
		queryFn: async () => GetBillingPaymentMethods(accessToken),
	});
}
