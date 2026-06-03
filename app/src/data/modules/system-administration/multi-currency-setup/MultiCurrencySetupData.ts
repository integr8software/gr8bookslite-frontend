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

export const MultiCurrencyRateAsOf = "2026-06-01";
export const DefaultPreferredBaseCurrencyCode = "PHP";
export const DefaultWantedCurrencyCode = "USD";

export const MultiCurrencyCatalog: MultiCurrencyCatalogItem[] = [
	{
		code: "PHP",
		country: "Philippines",
		decimalPlaces: 2,
		isDefault: true,
		isEnabled: true,
		name: "Philippine Peso",
		referencePerUsd: 56.48,
		source: "API",
		symbol: "PHP",
	},
	{
		code: "USD",
		country: "United States",
		decimalPlaces: 2,
		isEnabled: true,
		name: "US Dollar",
		referencePerUsd: 1,
		source: "API",
		symbol: "USD",
	},
	{
		code: "EUR",
		country: "Euro Area",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Euro",
		referencePerUsd: 0.92,
		source: "API",
		symbol: "EUR",
	},
	{
		code: "JPY",
		country: "Japan",
		decimalPlaces: 0,
		isEnabled: true,
		name: "Japanese Yen",
		referencePerUsd: 156.74,
		source: "API",
		symbol: "JPY",
	},
	{
		code: "SGD",
		country: "Singapore",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Singapore Dollar",
		referencePerUsd: 1.35,
		source: "API",
		symbol: "SGD",
	},
	{
		code: "GBP",
		country: "United Kingdom",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Pound Sterling",
		referencePerUsd: 0.79,
		source: "API",
		symbol: "GBP",
	},
	{
		code: "AUD",
		country: "Australia",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Australian Dollar",
		referencePerUsd: 1.51,
		source: "Manual",
		symbol: "AUD",
	},
	{
		code: "CAD",
		country: "Canada",
		decimalPlaces: 2,
		isEnabled: false,
		name: "Canadian Dollar",
		referencePerUsd: 1.37,
		source: "API",
		symbol: "CAD",
	},
	{
		code: "INR",
		country: "India",
		decimalPlaces: 2,
		isEnabled: false,
		name: "Indian Rupee",
		referencePerUsd: 83.18,
		source: "API",
		symbol: "INR",
	},
];

export const MultiCurrencySourceSummary = {
	autoUpdate: true,
	backupSource: "Manual Entry",
	lastUpdated: "Jun 1, 2026 10:30 AM",
	primarySource: "Open Exchange Rates",
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
		id: "round_aud_sales",
		appliesTo: "Sales Invoices",
		currencyCode: "AUD",
		precision: 2,
		roundingDirection: "Away From Zero",
		roundingMethod: "Half Up",
		status: "Inactive",
	},
];

export const MockMultiCurrencyRateHistory: MultiCurrencyRateHistoryRecord[] = [
	{
		id: "history_php_usd_1",
		baseCurrencyCode: "PHP",
		rate: 0.017704,
		recordedAt: "Jun 1, 2026 10:30 AM",
		source: "API",
		targetCurrencyCode: "USD",
	},
	{
		id: "history_php_sgd_1",
		baseCurrencyCode: "PHP",
		rate: 0.023902,
		recordedAt: "Jun 1, 2026 10:30 AM",
		source: "API",
		targetCurrencyCode: "SGD",
	},
	{
		id: "history_php_aud_1",
		baseCurrencyCode: "PHP",
		rate: 0.026735,
		recordedAt: "May 31, 2026 4:15 PM",
		source: "Manual",
		targetCurrencyCode: "AUD",
	},
];

export const MockMultiCurrencyAuditLogs: MultiCurrencyAuditLogRecord[] = [
	{
		id: "audit_preference_save",
		action: "Updated currency preferences",
		performedAt: "Jun 1, 2026 10:32 AM",
		record: "Currency Preferences",
		user: "Admin User",
	},
	{
		id: "audit_manual_rate",
		action: "Added manual exchange override",
		performedAt: "Jun 1, 2026 10:31 AM",
		record: "PHP to USD",
		user: "Admin User",
	},
	{
		id: "audit_rate_refresh",
		action: "Refreshed API exchange rates",
		performedAt: "Jun 1, 2026 10:30 AM",
		record: "Open Exchange Rates",
		user: "System",
	},
];

export const MockMultiCurrencySetupRecords: MultiCurrencySetupRecord[] = [
	{
		id: "mcs_php_usd",
		baseCurrencyCode: "PHP",
		targetCurrencyCode: "USD",
		originalExchangeRate: 0.017704,
		rateDate: MultiCurrencyRateAsOf,
		source: "API",
		status: "Active",
		notes: "Default bank settlement currency.",
	},
	{
		id: "mcs_php_sgd",
		baseCurrencyCode: "PHP",
		targetCurrencyCode: "SGD",
		originalExchangeRate: 0.023902,
		rateDate: MultiCurrencyRateAsOf,
		source: "API",
		status: "Active",
		notes: "Singapore supplier payments.",
	},
	{
		id: "mcs_usd_php",
		baseCurrencyCode: "USD",
		targetCurrencyCode: "PHP",
		originalExchangeRate: 56.48,
		rateDate: MultiCurrencyRateAsOf,
		source: "API",
		status: "Active",
		notes: "Dollar invoice conversion.",
	},
	{
		id: "mcs_usd_eur",
		baseCurrencyCode: "USD",
		targetCurrencyCode: "EUR",
		originalExchangeRate: 0.92,
		rateDate: MultiCurrencyRateAsOf,
		source: "Manual",
		status: "Inactive",
		notes: "Paused EU pricing feed.",
	},
];

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
	return records.map((record) => {
		const currentRate = findFetchedRate(
			fetchedRates,
			record.targetCurrencyCode,
		);
		const currentExchangeRate =
			currentRate?.exchangeRate ?? record.originalExchangeRate;
		const variancePercent = getExchangeRateVariancePercent(
			record.originalExchangeRate,
			currentExchangeRate,
		);

		return {
			...record,
			baseCurrencyLabel: getCurrencyLabel(record.baseCurrencyCode),
			currentExchangeRate,
			currentExchangeRateDisplay: formatExchangeRate(currentExchangeRate),
			inverseExchangeRate: currentRate?.inverseExchangeRate ?? 0,
			originalExchangeRateDisplay: formatExchangeRate(
				record.originalExchangeRate,
			),
			rateAsOf: currentRate?.rateAsOf ?? record.rateDate,
			targetCurrencyLabel: getCurrencyLabel(record.targetCurrencyCode),
			varianceDisplay: formatVariancePercent(variancePercent),
			variancePercent,
		};
	});
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
