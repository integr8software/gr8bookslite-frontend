import {
	createMultiCurrencyFetchedRates,
} from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";

export async function FetchMultiCurrencyRates(baseCurrencyCode: string) {
	return createMultiCurrencyFetchedRates(baseCurrencyCode);
}
