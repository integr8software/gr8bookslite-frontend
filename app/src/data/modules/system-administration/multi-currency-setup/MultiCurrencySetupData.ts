import type {
	MultiCurrencyCatalogItem,
	MultiCurrencyFetchedRate,
	MultiCurrencySetupFormValues,
	MultiCurrencySetupRecord,
	MultiCurrencySetupTableRecord,
} from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

export const DefaultPreferredBaseCurrencyCode = "PHP";
export const DefaultWantedCurrencyCode = "USD";

export const MultiCurrencyCatalog: MultiCurrencyCatalogItem[] =
	createRuntimeCurrencyCatalog();

export const MultiCurrencySourceSummary = {
	autoUpdate: true,
	backupSource: "Frankfurter reference exchange-rate API",
	lastUpdated: "Latest available reference date",
	primarySource: "Bangko Sentral ng Pilipinas RERB",
	updateFrequency: "Daily",
};

export const MultiCurrencySetupInitialFormValues: MultiCurrencySetupFormValues =
	{
		baseCurrencyCode: DefaultPreferredBaseCurrencyCode,
		targetCurrencyCode: DefaultWantedCurrencyCode,
		rateDate: getTodayDateInputValue(),
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

export function findCurrencyByCode(code: string) {
	return MultiCurrencyCatalog.find((currency) => currency.code === code);
}

export function findFetchedRate(
	rates: MultiCurrencyFetchedRate[],
	targetCurrencyCode: string,
) {
	return rates.find((rate) => rate.targetCurrencyCode === targetCurrencyCode);
}

export function createMultiCurrencySetupRecordFromFetchedRate(
	rate: MultiCurrencyFetchedRate,
): MultiCurrencySetupRecord {
	return {
		id: `mcs_${rate.baseCurrencyCode.toLowerCase()}_${rate.targetCurrencyCode.toLowerCase()}`,
		baseCurrencyCode: rate.baseCurrencyCode,
		targetCurrencyCode: rate.targetCurrencyCode,
		originalExchangeRate: rate.exchangeRate,
		rateDate: rate.rateAsOf,
		source: "API",
		status: "Active",
		notes: `${getCurrencyLabel(rate.targetCurrencyCode)} daily reference rate.`,
	};
}

export function createMultiCurrencySetupRecordsFromFetchedRates(
	rates: MultiCurrencyFetchedRate[],
) {
	return rates
		.filter((rate) => rate.baseCurrencyCode !== rate.targetCurrencyCode)
		.map(createMultiCurrencySetupRecordFromFetchedRate);
}

export function createMultiCurrencyCatalogFromFetchedRates(
	rates: MultiCurrencyFetchedRate[],
) {
	const codes = new Set<string>();

	rates.forEach((rate) => {
		codes.add(rate.baseCurrencyCode);
		codes.add(rate.targetCurrencyCode);
	});

	return Array.from(codes)
		.sort()
		.map(createCurrencyCatalogItem);
}

export function getCurrencyLabel(code: string) {
	const currency = findCurrencyByCode(code);

	return currency ? `${currency.code} - ${currency.name}` : `${code} - ${getCurrencyName(code)}`;
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
			currencyDescription:
				currentRate?.targetCurrencyName ?? getCurrencyName(record.targetCurrencyCode),
			currencySymbol:
				currentRate?.targetCurrencySymbol ??
				getCurrencySymbol(record.targetCurrencyCode),
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

function createRuntimeCurrencyCatalog() {
	const supportedCurrencyCodes =
		typeof Intl.supportedValuesOf === "function"
			? Intl.supportedValuesOf("currency")
			: [DefaultPreferredBaseCurrencyCode, DefaultWantedCurrencyCode];

	return supportedCurrencyCodes.map(createCurrencyCatalogItem);
}

function createCurrencyCatalogItem(code: string): MultiCurrencyCatalogItem {
	return {
		code,
		country: "",
		decimalPlaces: getCurrencyDecimalPlaces(code),
		isDefault: code === DefaultPreferredBaseCurrencyCode,
		isEnabled: true,
		name: getCurrencyName(code),
		source: "API",
		symbol: getCurrencySymbol(code),
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

function getTodayDateInputValue() {
	return new Date().toISOString().slice(0, 10);
}
