import type { MultiCurrencyFetchedRate } from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

export async function FetchMultiCurrencyRates(baseCurrencyCode: string) {
	const response = await fetch(
		`/api/exchange-rates?base=${encodeURIComponent(baseCurrencyCode)}`,
		{ cache: "no-store" },
	);

	if (!response.ok) {
		throw new Error("Could not fetch live exchange rates.");
	}

	return (await response.json()) as MultiCurrencyFetchedRate[];
}
