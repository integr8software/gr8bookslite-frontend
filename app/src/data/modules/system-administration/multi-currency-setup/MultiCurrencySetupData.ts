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
		symbol: "₱",
	},
	{
		code: "USD",
		country: "United States",
		decimalPlaces: 2,
		isEnabled: true,
		name: "US Dollar",
		referencePerUsd: 1,
		source: "API",
		symbol: "$",
	},
	{
		code: "EUR",
		country: "Euro Area",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Euro",
		referencePerUsd: 0.92,
		source: "API",
		symbol: "€",
	},
	{
		code: "JPY",
		country: "Japan",
		decimalPlaces: 0,
		isEnabled: true,
		name: "Japanese Yen",
		referencePerUsd: 156.74,
		source: "API",
		symbol: "¥",
	},
	{
		code: "SGD",
		country: "Singapore",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Singapore Dollar",
		referencePerUsd: 1.35,
		source: "API",
		symbol: "S$",
	},
	{
		code: "GBP",
		country: "United Kingdom",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Pound Sterling",
		referencePerUsd: 0.79,
		source: "API",
		symbol: "£",
	},
	{
		code: "AUD",
		country: "Australia",
		decimalPlaces: 2,
		isEnabled: true,
		name: "Australian Dollar",
		referencePerUsd: 1.51,
		source: "Manual",
		symbol: "A$",
	},
	{
		code: "CAD",
		country: "Canada",
		decimalPlaces: 2,
		isEnabled: false,
		name: "Canadian Dollar",
		referencePerUsd: 1.37,
		source: "API",
		symbol: "C$",
	},
	{
		code: "INR",
		country: "India",
		decimalPlaces: 2,
		isEnabled: false,
		name: "Indian Rupee",
		referencePerUsd: 83.18,
		source: "API",
		symbol: "₹",
	},
];

export const MultiCurrencySourceSummary = {
	autoUpdate: true,
	backupSource: "Manual Entry",
	lastUpdated: "Latest available reference date",
	primarySource: "Frankfurter",
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

export const MockMultiCurrencySetupRecords: MultiCurrencySetupRecord[] =
	MultiCurrencyCatalog.flatMap((baseCurrency) =>
		MultiCurrencyCatalog.filter(
			(targetCurrency) => targetCurrency.code !== baseCurrency.code,
		).map((targetCurrency) => ({
			baseCurrencyCode: baseCurrency.code,
			id: `mcs_${baseCurrency.code.toLowerCase()}_${targetCurrency.code.toLowerCase()}`,
			notes: `${targetCurrency.name} daily exchange rate.`,
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
	baseCurrencyCode: string,
): MultiCurrencySetupTableRecord[] {
	const baseCurrency = findCurrencyByCode(baseCurrencyCode);
	const baseRate = findFetchedRate(fetchedRates, baseCurrencyCode);
	const baseRecord: MultiCurrencySetupTableRecord[] = baseCurrency
		? [
				{
					baseCurrencyCode,
					baseCurrencyLabel: getCurrencyLabel(baseCurrencyCode),
					currencyCode: baseCurrency.code,
					currencyDescription: baseCurrency.name,
					currencySymbol: baseCurrency.symbol,
					currentExchangeRate: 1,
					currentExchangeRateDisplay: formatExchangeRate(1),
					dailyExchangeRate: 1,
					dailyExchangeRateDisplay: formatExchangeRate(1),
					id: `base_${baseCurrencyCode.toLowerCase()}`,
					inverseExchangeRate: 1,
					isBaseCurrency: true,
					originalExchangeRate: 1,
					originalExchangeRateDisplay: formatExchangeRate(1),
					rateAsOf: baseRate?.rateAsOf ?? MultiCurrencyRateAsOf,
					rateDate: baseRate?.rateAsOf ?? MultiCurrencyRateAsOf,
					source: "API",
					status: "Active",
					targetCurrencyCode: baseCurrencyCode,
					targetCurrencyLabel: getCurrencyLabel(baseCurrencyCode),
					varianceDisplay: formatVariancePercent(0),
					variancePercent: 0,
				},
			]
		: [];
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
			record.source === "Manual"
				? configuredDailyRate
				: currentRate?.inverseExchangeRate ?? configuredDailyRate;
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

	return [...baseRecord, ...currencyRecords];
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
