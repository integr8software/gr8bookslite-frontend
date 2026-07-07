export type MultiCurrencyStatus = "Active" | "Inactive";
export type MultiCurrencyRateSource = "API" | "Manual";
export type MultiCurrencyRateUpdateMode = "overwrite" | "unmodified";

export type MultiCurrencyCatalogItem = {
	code: string;
	country: string;
	decimalPlaces: number;
	isDefault?: boolean;
	isEnabled: boolean;
	name: string;
	referencePerUsd: number;
	source: MultiCurrencyRateSource;
	symbol: string;
};

export type MultiCurrencyFetchedRate = {
	baseCurrencyCode: string;
	baseOriginalExchangeRate: number;
	exchangeRate: number;
	inverseExchangeRate: number;
	rateAsOf: string;
	targetCurrencyCode: string;
};

export type MultiCurrencySetupRecord = {
	baseCurrencyCode: string;
	id: string;
	notes?: string;
	originalExchangeRate: number;
	rateDate: string;
	source?: MultiCurrencyRateSource;
	status: MultiCurrencyStatus;
	targetCurrencyCode: string;
};

export type MultiCurrencySetupFormValues = {
	baseCurrencyCode: string;
	notes: string;
	rateDate: string;
	status: MultiCurrencyStatus;
	targetCurrencyCode: string;
};

export type MultiCurrencySetupFormErrors = Partial<
	Record<keyof MultiCurrencySetupFormValues, string>
>;

export type MultiCurrencySetupActionMode = "add" | "edit" | "view";

export type MultiCurrencySetupTableColumnKey =
	| "currencyCode"
	| "currencyDescription"
	| "currencySymbol"
	| "dailyExchangeRateDisplay"
	| "rateAsOf"
	| "source"
	| "status"
	| "targetCurrencyLabel";

export type MultiCurrencySetupTableRecord = MultiCurrencySetupRecord & {
	baseCurrencyLabel: string;
	currencyCode: string;
	currencyDescription: string;
	currencySymbol: string;
	currentExchangeRate: number;
	currentExchangeRateDisplay: string;
	dailyExchangeRate: number;
	dailyExchangeRateDisplay: string;
	inverseExchangeRate: number;
	isBaseCurrency: boolean;
	originalExchangeRateDisplay: string;
	rateAsOf: string;
	targetCurrencyLabel: string;
	varianceDisplay: string;
	variancePercent: number;
};

export type MultiCurrencySetupDrawerMode = "add" | "edit";

export type MultiCurrencySetupDrawerValues = {
	baseCurrencyCode: string;
	configuredExchangeRate: string;
	notes: string;
	rateDate: string;
	source: MultiCurrencyRateSource;
	status: MultiCurrencyStatus;
	targetCurrencyCode: string;
};

export type MultiCurrencyRoundingRule = {
	appliesTo: string;
	currencyCode: string;
	id: string;
	precision: number;
	roundingDirection: "Away From Zero" | "Toward Zero";
	roundingMethod: "Half Up" | "Down" | "Up";
	status: MultiCurrencyStatus;
};

export type MultiCurrencyRateHistoryRecord = {
	baseCurrencyCode: string;
	id: string;
	rate: number;
	recordedAt: string;
	source: "API" | "Manual";
	targetCurrencyCode: string;
};

export type MultiCurrencyAuditLogRecord = {
	action: string;
	id: string;
	performedAt: string;
	record: string;
	user: string;
};
