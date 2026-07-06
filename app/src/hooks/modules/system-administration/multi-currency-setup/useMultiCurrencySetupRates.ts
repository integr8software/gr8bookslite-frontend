"use client";

import { useQuery } from "@tanstack/react-query";
import { FetchMultiCurrencyRates } from "@/app/src/services/modules/system-administration/multi-currency-setup/MultiCurrencySetupService";
import { MultiCurrencySetupQueryKeys } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetup";

export function useMultiCurrencySetupRates(baseCurrencyCode: string) {
	return useQuery({
		queryKey: MultiCurrencySetupQueryKeys.rates(baseCurrencyCode),
		queryFn: () => FetchMultiCurrencyRates(baseCurrencyCode),
		refetchOnWindowFocus: false,
		staleTime: 15 * 60 * 1000,
	});
}
