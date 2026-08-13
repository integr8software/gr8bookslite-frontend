import type { CurrencyReference } from "@/app/src/types/shared/reference/ReferenceTypes";
import type {
	MultiCurrencyCatalogItem,
	MultiCurrencyFetchedRate,
} from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

export const StableCurrencyReferences: readonly CurrencyReference[] = [
	{ code: "AED", name: "United Arab Emirates Dirham", symbol: "د.إ" },
	{ code: "AUD", name: "Australian Dollar", symbol: "$" },
	{ code: "BRL", name: "Brazilian Real", symbol: "R$" },
	{ code: "CAD", name: "Canadian Dollar", symbol: "$" },
	{ code: "CHF", name: "Swiss Franc", symbol: "CHF" },
	{ code: "CNY", name: "Chinese Yuan", symbol: "¥" },
	{ code: "EUR", name: "Euro", symbol: "€" },
	{ code: "GBP", name: "British Pound", symbol: "£" },
	{ code: "HKD", name: "Hong Kong Dollar", symbol: "$" },
	{ code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
	{ code: "INR", name: "Indian Rupee", symbol: "₹" },
	{ code: "JPY", name: "Japanese Yen", symbol: "¥" },
	{ code: "KRW", name: "South Korean Won", symbol: "₩" },
	{ code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
	{ code: "PHP", name: "Philippine Peso", symbol: "₱" },
	{ code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
	{ code: "SGD", name: "Singapore Dollar", symbol: "$" },
	{ code: "THB", name: "Thai Baht", symbol: "฿" },
	{ code: "USD", name: "United States Dollar", symbol: "$" },
	{ code: "VND", name: "Vietnamese Dong", symbol: "₫" },
];

export function createCurrencyCatalogFromReferencesAndRates(
	currencies: readonly CurrencyReference[],
	rates: MultiCurrencyFetchedRate[] = [],
	baseCurrencyCode?: string,
): MultiCurrencyCatalogItem[] {
	const catalogByCode = new Map<string, MultiCurrencyCatalogItem>();

	currencies.forEach((currency) => {
		catalogByCode.set(currency.code, createCurrencyCatalogItem(currency));
	});

	rates.forEach((rate) => {
		const existing = catalogByCode.get(rate.targetCurrencyCode);

		catalogByCode.set(rate.targetCurrencyCode, {
			...createCurrencyCatalogItem({
				code: rate.targetCurrencyCode,
				name: rate.targetCurrencyName ?? rate.targetCurrencyCode,
				symbol: rate.targetCurrencySymbol ?? rate.targetCurrencyCode,
			}),
			...existing,
			isEnabled: true,
		});
	});

	if (baseCurrencyCode && !catalogByCode.has(baseCurrencyCode)) {
		catalogByCode.set(
			baseCurrencyCode,
			createCurrencyCatalogItem({
				code: baseCurrencyCode,
				name: getCurrencyName(baseCurrencyCode),
				symbol: getCurrencySymbol(baseCurrencyCode),
			}),
		);
	}

	return Array.from(catalogByCode.values()).sort((first, second) =>
		first.code.localeCompare(second.code),
	);
}

export function resolveFetchedExchangeRate(
	rates: MultiCurrencyFetchedRate[],
	baseCurrencyCode: string,
	targetCurrencyCode: string,
) {
	const normalizedBaseCurrencyCode = baseCurrencyCode.trim().toUpperCase();
	const normalizedTargetCurrencyCode = targetCurrencyCode.trim().toUpperCase();

	if (normalizedBaseCurrencyCode === normalizedTargetCurrencyCode) {
		return 1;
	}

	return rates.find(
		(rate) =>
			rate.baseCurrencyCode === normalizedBaseCurrencyCode &&
			rate.targetCurrencyCode === normalizedTargetCurrencyCode,
	)?.exchangeRate;
}

export function getCurrencyDisplayLabel(code: string, currencies: CurrencyReference[]) {
	const normalizedCode = code.trim().toUpperCase();
	const currency = currencies.find((record) => record.code === normalizedCode);

	return currency
		? `${currency.code} - ${currency.name}`
		: `${normalizedCode} - ${getCurrencyName(normalizedCode)}`;
}

function createCurrencyCatalogItem(
	currency: Pick<CurrencyReference, "code" | "name" | "symbol">,
): MultiCurrencyCatalogItem {
	return {
		code: currency.code,
		country: "",
		decimalPlaces: getCurrencyDecimalPlaces(currency.code),
		isDefault: false,
		isEnabled: true,
		name: currency.name,
		source: "API",
		symbol: currency.symbol,
	};
}

function getCurrencyName(code: string) {
	try {
		return (
			new Intl.DisplayNames(["en"], { type: "currency" }).of(code) ?? code
		);
	} catch {
		return code;
	}
}

function getCurrencySymbol(code: string) {
	try {
		const parts = new Intl.NumberFormat("en-US", {
			currency: code,
			currencyDisplay: "narrowSymbol",
			style: "currency",
		}).formatToParts(1);

		return parts.find((part) => part.type === "currency")?.value ?? code;
	} catch {
		return code;
	}
}

function getCurrencyDecimalPlaces(code: string) {
	try {
		return new Intl.NumberFormat("en-US", {
			currency: code,
			style: "currency",
		}).resolvedOptions().maximumFractionDigits ?? 2;
	} catch {
		return 2;
	}
}
