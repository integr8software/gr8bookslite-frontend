import { MultiCurrencyCatalog } from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import type { MultiCurrencyFetchedRate } from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

const FrankfurterRatesUrl = "https://api.frankfurter.dev/v2/rates";

type FrankfurterRate = {
	base: string;
	date: string;
	quote: string;
	rate: number;
};

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const requestedBase = requestUrl.searchParams.get("base")?.toUpperCase();
	const baseCurrency = MultiCurrencyCatalog.find(
		(currency) => currency.code === requestedBase,
	);

	if (!baseCurrency) {
		return Response.json(
			{ message: "Select a supported base currency." },
			{ status: 400 },
		);
	}

	const quoteCurrencies = MultiCurrencyCatalog.filter(
		(currency) => currency.code !== baseCurrency.code,
	).map((currency) => currency.code);
	const frankfurterUrl = new URL(FrankfurterRatesUrl);
	frankfurterUrl.searchParams.set("base", baseCurrency.code);
	frankfurterUrl.searchParams.set("quotes", quoteCurrencies.join(","));

	try {
		const response = await fetch(frankfurterUrl, {
			headers: { Accept: "application/json" },
			next: { revalidate: 60 * 60 },
		});

		if (!response.ok) {
			throw new Error(`Frankfurter returned ${response.status}.`);
		}

		const payload = (await response.json()) as FrankfurterRate[];
		const rates: MultiCurrencyFetchedRate[] = [
			{
				baseCurrencyCode: baseCurrency.code,
				baseOriginalExchangeRate: 1,
				exchangeRate: 1,
				inverseExchangeRate: 1,
				rateAsOf: payload[0]?.date ?? new Date().toISOString().slice(0, 10),
				targetCurrencyCode: baseCurrency.code,
			},
			...payload
				.filter(
					(rate) =>
						rate.base === baseCurrency.code &&
						quoteCurrencies.includes(rate.quote) &&
						Number.isFinite(rate.rate) &&
						rate.rate > 0,
				)
				.map((rate) => ({
					baseCurrencyCode: rate.base,
					baseOriginalExchangeRate: 1,
					exchangeRate: rate.rate,
					inverseExchangeRate: 1 / rate.rate,
					rateAsOf: rate.date,
					targetCurrencyCode: rate.quote,
				})),
		];

		return Response.json(rates);
	} catch {
		return Response.json(
			{ message: "Live exchange rates are temporarily unavailable." },
			{ status: 502 },
		);
	}
}
