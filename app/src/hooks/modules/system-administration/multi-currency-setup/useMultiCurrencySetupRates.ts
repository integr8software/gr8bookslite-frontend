"use client";

import { useQuery } from "@tanstack/react-query";
import { createMultiCurrencyFetchedRates } from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import { FetchMultiCurrencyRates } from "@/app/src/services/modules/system-administration/multi-currency-setup/MultiCurrencySetupService";
import { MultiCurrencySetupQueryKeys } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetup";

export function useMultiCurrencySetupRates(baseCurrencyCode: string) {
	return useQuery({
		queryKey: MultiCurrencySetupQueryKeys.rates(baseCurrencyCode),
		queryFn: () => FetchMultiCurrencyRates(baseCurrencyCode),
		initialData: () => createMultiCurrencyFetchedRates(baseCurrencyCode),
	});
}
