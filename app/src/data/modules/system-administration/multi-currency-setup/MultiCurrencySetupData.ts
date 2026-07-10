import type {
	MultiCurrencyCatalogItem,
	MultiCurrencyAuditLogRecord,
	MultiCurrencyFetchedRate,
	MultiCurrencyRateHistoryRecord,
	MultiCurrencyRoundingRule,
	MultiCurrencySetupFormValues,
	MultiCurrencySetupRecord,
	MultiCurrencySetupTableRecord,
} from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

export const MultiCurrencyRateAsOf = "2026-07-09";
export const DefaultPreferredBaseCurrencyCode = "PHP";
export const DefaultWantedCurrencyCode = "USD";

const BspMultiCurrencyCatalog: MultiCurrencyCatalogItem[] = [
	{
		code: "PHP",
		country: "Philippines",
		decimalPlaces: 2,
		isDefault: true,
		isEnabled: true,
		name: "Philippine Peso",
		referencePerUsd: 61.552,
		source: "API",
		symbol: "₱",
	},
	{
		code: "USD",
		country: "United States",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Dollar",
		referencePerUsd: 1,
		source: "API",
		symbol: "$",
	},
	{
		code: "JPY",
		country: "Japan",
		decimalPlaces: 0,
		isEnabled: true,
		name: "Yen",
		referencePerUsd: 162.538949,
		source: "API",
		symbol: "¥",
	},
	{
		code: "GBP",
		country: "United Kingdom",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Pound",
		referencePerUsd: 0.746547,
		source: "API",
		symbol: "£",
	},
	{
		code: "HKD",
		country: "Hong Kong",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Dollar",
		referencePerUsd: 7.839221,
		source: "API",
		symbol: "HK$",
	},
	{
		code: "CHF",
		country: "Switzerland",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Franc",
		referencePerUsd: 0.808499,
		source: "API",
		symbol: "Fr",
	},
	{
		code: "CAD",
		country: "Canada",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Dollar",
		referencePerUsd: 1.4173,
		source: "API",
		symbol: "C$",
	},
	{
		code: "SGD",
		country: "Singapore",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Dollar",
		referencePerUsd: 1.293199,
		source: "API",
		symbol: "S$",
	},
	{
		code: "AUD",
		country: "Australia",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Dollar",
		referencePerUsd: 1.443417,
		source: "API",
		symbol: "A$",
	},
	{
		code: "BHD",
		country: "Bahrain",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Dinar",
		referencePerUsd: 0.376897,
		source: "API",
		symbol: "BD",
	},
	{
		code: "KWD",
		country: "Kuwait",
		decimalPlaces: 3,
		isEnabled: true,
		name: "Dinar",
		referencePerUsd: 0.306,
		source: "API",
		symbol: "KD",
	},
	{
		code: "SAR",
		country: "Saudi Arabia",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Riyal",
		referencePerUsd: 3.755,
		source: "API",
		symbol: "SR",
	},
	{
		code: "BND",
		country: "Brunei",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Dollar",
		referencePerUsd: 1.2982,
		source: "API",
		symbol: "B$",
	},
	{
		code: "IDR",
		country: "Indonesia",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Rupiah",
		referencePerUsd: 18103.529412,
		source: "API",
		symbol: "Rp",
	},
	{
		code: "THB",
		country: "Thailand",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Baht",
		referencePerUsd: 33.450353,
		source: "API",
		symbol: "฿",
	},
	{
		code: "AED",
		country: "United Arab Emirates",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Dirham",
		referencePerUsd: 3.673961,
		source: "API",
		symbol: "د.إ",
	},
	{
		code: "EUR",
		country: "European Monetary Union",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Euro",
		referencePerUsd: 0.875501,
		source: "API",
		symbol: "€",
	},
	{
		code: "KRW",
		country: "Korea",
		decimalPlaces: 0,
		isEnabled: true,
		name: "Won",
		referencePerUsd: 1504.938875,
		source: "API",
		symbol: "₩",
	},
	{
		code: "CNY",
		country: "China",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Yuan",
		referencePerUsd: 6.804709,
		source: "API",
		symbol: "¥",
	},
	{
		code: "ARS",
		country: "Argentina",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Peso",
		referencePerUsd: 1486.763285,
		source: "API",
		symbol: "$",
	},
	{
		code: "BRL",
		country: "Brazil",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Real",
		referencePerUsd: 5.148892,
		source: "API",
		symbol: "R$",
	},
	{
		code: "DKK",
		country: "Denmark",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Kroner",
		referencePerUsd: 6.545695,
		source: "API",
		symbol: "kr",
	},
	{
		code: "INR",
		country: "India",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Rupee",
		referencePerUsd: 95.548743,
		source: "API",
		symbol: "₹",
	},
	{
		code: "MYR",
		country: "Malaysia",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Ringgit",
		referencePerUsd: 4.073997,
		source: "API",
		symbol: "RM",
	},
	{
		code: "MXN",
		country: "Mexico",
		decimalPlaces: 2,
		isEnabled: true,
		name: "New Peso",
		referencePerUsd: 17.571796,
		source: "API",
		symbol: "$",
	},
	{
		code: "NZD",
		country: "New Zealand",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Dollar",
		referencePerUsd: 1.75499,
		source: "API",
		symbol: "NZ$",
	},
	{
		code: "NOK",
		country: "Norway",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Kroner",
		referencePerUsd: 9.758388,
		source: "API",
		symbol: "kr",
	},
	{
		code: "PKR",
		country: "Pakistan",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Rupee",
		referencePerUsd: 277.761733,
		source: "API",
		symbol: "Rs",
	},
	{
		code: "ZAR",
		country: "South Africa",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Rand",
		referencePerUsd: 16.421839,
		source: "API",
		symbol: "R",
	},
	{
		code: "SEK",
		country: "Sweden",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Kroner",
		referencePerUsd: 9.680101,
		source: "API",
		symbol: "kr",
	},
	{
		code: "SYP",
		country: "Syria",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Pound",
		referencePerUsd: 121.49625,
		source: "API",
		symbol: "£",
	},
	{
		code: "TWD",
		country: "Taiwan",
		decimalPlaces: 2,
		isEnabled: true,
		name: "NT Dollar",
		referencePerUsd: 32.108503,
		source: "API",
		symbol: "NT$",
	},
	{
		code: "VES",
		country: "Venezuela",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Bolivar",
		referencePerUsd: 698.660613,
		source: "API",
		symbol: "Bs",
	},
];

const MultiCurrencyPopularityOrder = [
	"PHP",
	"USD",
	"EUR",
	"JPY",
	"GBP",
	"CNY",
	"AUD",
	"CAD",
	"CHF",
	"HKD",
	"SGD",
	"KRW",
	"INR",
	"NZD",
	"SEK",
	"NOK",
	"DKK",
	"MYR",
	"THB",
	"IDR",
	"SAR",
	"AED",
	"BHD",
	"KWD",
	"BND",
	"BRL",
	"MXN",
	"ZAR",
	"TWD",
	"PKR",
	"ARS",
	"VES",
	"SYP",
];

export const MultiCurrencyCatalog: MultiCurrencyCatalogItem[] = [
	...BspMultiCurrencyCatalog,
].sort(
	(firstCurrency, secondCurrency) =>
		MultiCurrencyPopularityOrder.indexOf(firstCurrency.code) -
		MultiCurrencyPopularityOrder.indexOf(secondCurrency.code),
);

export const MultiCurrencySourceSummary = {
	autoUpdate: true,
	backupSource: "BSP RERB workbook",
	lastUpdated: "Latest available reference date",
	primarySource: "Bangko Sentral ng Pilipinas RERB",
	updateFrequency: "Daily",
};

export const MockMultiCurrencyRoundingRules: MultiCurrencyRoundingRule[] = [
	{
		id: "round_php_all",
		appliesTo: "All Transactions",
		currencyCode: "PHP",
		precision: 2,
		roundingDirection: "Away From Zero",
		roundingMethod: "Half Up",
		status: "Active",
	},
	{
		id: "round_usd_all",
		appliesTo: "All Transactions",
		currencyCode: "USD",
		precision: 2,
		roundingDirection: "Away From Zero",
		roundingMethod: "Half Up",
		status: "Active",
	},
	{
		id: "round_jpy_all",
		appliesTo: "All Transactions",
		currencyCode: "JPY",
		precision: 0,
		roundingDirection: "Toward Zero",
		roundingMethod: "Down",
		status: "Active",
	},
	{
		id: "round_krw_sales",
		appliesTo: "Sales Invoices",
		currencyCode: "KRW",
		precision: 0,
		roundingDirection: "Away From Zero",
		roundingMethod: "Half Up",
		status: "Active",
	},
];

export const MockMultiCurrencyRateHistory: MultiCurrencyRateHistoryRecord[] = [
	{
		id: "history_php_usd_1",
		baseCurrencyCode: "PHP",
		rate: 0.016246,
		recordedAt: "Jul 9, 2026 8:51 AM",
		source: "API",
		targetCurrencyCode: "USD",
	},
	{
		id: "history_php_jpy_1",
		baseCurrencyCode: "PHP",
		rate: 2.640683,
		recordedAt: "Jul 9, 2026 8:51 AM",
		source: "API",
		targetCurrencyCode: "JPY",
	},
	{
		id: "history_php_kwd_1",
		baseCurrencyCode: "PHP",
		rate: 0.004972,
		recordedAt: "Jul 9, 2026 8:51 AM",
		source: "API",
		targetCurrencyCode: "KWD",
	},
];

export const MockMultiCurrencyAuditLogs: MultiCurrencyAuditLogRecord[] = [
	{
		id: "audit_preference_save",
		action: "Updated currency preferences",
		performedAt: "Jul 9, 2026 8:53 AM",
		record: "Currency Preferences",
		user: "Admin User",
	},
	{
		id: "audit_manual_rate",
		action: "Added manual exchange override",
		performedAt: "Jul 9, 2026 8:52 AM",
		record: "PHP to KWD",
		user: "Admin User",
	},
	{
		id: "audit_rate_refresh",
		action: "Refreshed BSP reference exchange rates",
		performedAt: "Jul 9, 2026 8:51 AM",
		record: "BSP RERB",
		user: "System",
	},
];

export const MockMultiCurrencySetupRecords: MultiCurrencySetupRecord[] =
	MultiCurrencyCatalog.flatMap((baseCurrency) =>
		MultiCurrencyCatalog.filter(
			(targetCurrency) => targetCurrency.code !== baseCurrency.code,
		).map((targetCurrency) => ({
			baseCurrencyCode: baseCurrency.code,
			id: `mcs_${baseCurrency.code.toLowerCase()}_${targetCurrency.code.toLowerCase()}`,
			notes: `${targetCurrency.country} ${targetCurrency.name} daily BSP reference rate.`,
			originalExchangeRate:
				targetCurrency.referencePerUsd / baseCurrency.referencePerUsd,
			rateDate: MultiCurrencyRateAsOf,
			source: targetCurrency.source,
			status: targetCurrency.isEnabled ? "Active" : "Inactive",
			targetCurrencyCode: targetCurrency.code,
		})),
	);

export const MultiCurrencySetupInitialFormValues: MultiCurrencySetupFormValues =
	{
		baseCurrencyCode: DefaultPreferredBaseCurrencyCode,
		targetCurrencyCode: DefaultWantedCurrencyCode,
		rateDate: MultiCurrencyRateAsOf,
		status: "Active",
		notes: "",
	};

export function createMultiCurrencySetupFormValues(
	record: MultiCurrencySetupRecord,
): MultiCurrencySetupFormValues {
	return {
		baseCurrencyCode: record.baseCurrencyCode,
		targetCurrencyCode: record.targetCurrencyCode,
		rateDate: record.rateDate,
		status: record.status,
		notes: record.notes ?? "",
	};
}

export function createMultiCurrencyFetchedRates(
	baseCurrencyCode: string,
): MultiCurrencyFetchedRate[] {
	const baseCurrency =
		findCurrencyByCode(baseCurrencyCode) ??
		findCurrencyByCode(DefaultPreferredBaseCurrencyCode);

	if (!baseCurrency) {
		return [];
	}

	return MultiCurrencyCatalog.map((targetCurrency) =>
		createMultiCurrencyFetchedRate(baseCurrency.code, targetCurrency.code),
	).filter((rate): rate is MultiCurrencyFetchedRate => Boolean(rate));
}

export function createMultiCurrencyFetchedRate(
	baseCurrencyCode: string,
	targetCurrencyCode: string,
): MultiCurrencyFetchedRate | null {
	const baseCurrency = findCurrencyByCode(baseCurrencyCode);
	const targetCurrency = findCurrencyByCode(targetCurrencyCode);

	if (!baseCurrency || !targetCurrency) {
		return null;
	}

	const exchangeRate =
		targetCurrency.referencePerUsd / baseCurrency.referencePerUsd;

	return {
		baseCurrencyCode: baseCurrency.code,
		baseOriginalExchangeRate: 1,
		exchangeRate,
		inverseExchangeRate: exchangeRate === 0 ? 0 : 1 / exchangeRate,
		rateAsOf: MultiCurrencyRateAsOf,
		targetCurrencyCode: targetCurrency.code,
	};
}

export function findCurrencyByCode(code: string) {
	return MultiCurrencyCatalog.find((currency) => currency.code === code);
}

export function findFetchedRate(
	rates: MultiCurrencyFetchedRate[],
	targetCurrencyCode: string,
) {
	return rates.find((rate) => rate.targetCurrencyCode === targetCurrencyCode);
}

export function getCurrencyLabel(code: string) {
	const currency = findCurrencyByCode(code);

	return currency ? `${currency.code} - ${currency.name}` : code;
}

export function createMultiCurrencySetupRecord(
	values: MultiCurrencySetupFormValues,
	fetchedRate?: MultiCurrencyFetchedRate,
): MultiCurrencySetupRecord {
	return {
		id: `mcs_${Date.now().toString(36)}`,
		baseCurrencyCode: values.baseCurrencyCode,
		targetCurrencyCode: values.targetCurrencyCode,
		originalExchangeRate: fetchedRate?.exchangeRate ?? 1,
		rateDate: values.rateDate,
		source: "API",
		status: values.status,
		notes: values.notes.trim() || undefined,
	};
}

export function updateMultiCurrencySetupRecord(
	record: MultiCurrencySetupRecord,
	values: MultiCurrencySetupFormValues,
	fetchedRate?: MultiCurrencyFetchedRate,
): MultiCurrencySetupRecord {
	const didCurrencyPairChange =
		record.baseCurrencyCode !== values.baseCurrencyCode ||
		record.targetCurrencyCode !== values.targetCurrencyCode;

	return {
		...record,
		baseCurrencyCode: values.baseCurrencyCode,
		targetCurrencyCode: values.targetCurrencyCode,
		originalExchangeRate: didCurrencyPairChange
			? fetchedRate?.exchangeRate ?? record.originalExchangeRate
			: record.originalExchangeRate,
		rateDate: values.rateDate,
		source: record.source ?? "API",
		status: values.status,
		notes: values.notes.trim() || undefined,
	};
}

export function createMultiCurrencySetupTableRecords(
	records: MultiCurrencySetupRecord[],
	fetchedRates: MultiCurrencyFetchedRate[],
): MultiCurrencySetupTableRecord[] {
	const currencyRecords = records.map((record) => {
		const currentRate = findFetchedRate(
			fetchedRates,
			record.targetCurrencyCode,
		);
		const currentExchangeRate =
			currentRate?.exchangeRate ?? record.originalExchangeRate;
		const currency = findCurrencyByCode(record.targetCurrencyCode);
		const configuredDailyRate =
			record.originalExchangeRate === 0
				? 0
				: 1 / record.originalExchangeRate;
		const dailyExchangeRate =
			currentRate?.inverseExchangeRate ?? configuredDailyRate;
		const variancePercent = getExchangeRateVariancePercent(
			record.originalExchangeRate,
			currentExchangeRate,
		);

		return {
			...record,
			baseCurrencyLabel: getCurrencyLabel(record.baseCurrencyCode),
			currencyCode: record.targetCurrencyCode,
			currencyDescription: currency?.name ?? record.targetCurrencyCode,
			currencySymbol: currency?.symbol ?? record.targetCurrencyCode,
			currentExchangeRate,
			currentExchangeRateDisplay: formatExchangeRate(currentExchangeRate),
			dailyExchangeRate,
			dailyExchangeRateDisplay: formatExchangeRate(dailyExchangeRate),
			inverseExchangeRate: currentRate?.inverseExchangeRate ?? 0,
			isBaseCurrency: false,
			originalExchangeRateDisplay: formatExchangeRate(
				record.originalExchangeRate,
			),
			rateAsOf: currentRate?.rateAsOf ?? record.rateDate,
			targetCurrencyLabel: getCurrencyLabel(record.targetCurrencyCode),
			varianceDisplay: formatVariancePercent(variancePercent),
			variancePercent,
		};
	});

	return currencyRecords;
}

export function getExchangeRateVariancePercent(
	originalExchangeRate: number,
	currentExchangeRate: number,
) {
	if (originalExchangeRate === 0) {
		return 0;
	}

	return (
		((currentExchangeRate - originalExchangeRate) / originalExchangeRate) *
		100
	);
}

export function formatExchangeRate(rate: number) {
	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 6,
		minimumFractionDigits: 6,
	}).format(rate);
}

export function formatVariancePercent(variancePercent: number) {
	const sign = variancePercent > 0 ? "+" : "";

	return `${sign}${new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	}).format(variancePercent)}%`;
}
