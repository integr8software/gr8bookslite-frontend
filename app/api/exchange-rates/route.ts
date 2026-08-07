import type { MultiCurrencyFetchedRate } from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

export const runtime = "nodejs";

const BspRerbUrls = [
	"https://www.bsp.gov.ph/Statistics/RERB/RERB.xlsx",
	"https://www.bsp.gov.ph/statistics/rerb/rerb.xlsx",
];
const FrankfurterExchangeRateUrl = "https://api.frankfurter.app/latest";
const OpenExchangeRateUrl = "https://open.er-api.com/v6/latest";

type RateTable = {
	baseCurrencyCode?: string;
	date: string;
	ratesByCurrency: Map<string, number>;
	source: string;
};

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const requestedBase =
		requestUrl.searchParams.get("base")?.toUpperCase() ?? "PHP";

	try {
		const rateTable = await fetchRateTable(requestedBase);
		const rates = createFetchedRates(requestedBase, rateTable);

		if (rates.length === 0) {
			return Response.json(
				{ message: "The selected base currency is unavailable." },
				{ status: 422 },
			);
		}

		return Response.json(rates);
	} catch {
		return Response.json(
			{ message: "Exchange rates are temporarily unavailable." },
			{ status: 502 },
		);
	}
}

async function fetchRateTable(baseCurrencyCode: string): Promise<RateTable> {
	try {
		return await fetchBspRateTable();
	} catch {
		return fetchFallbackRateTable(baseCurrencyCode);
	}
}

function createFetchedRates(
	baseCurrencyCode: string,
	rateTable: RateTable,
): MultiCurrencyFetchedRate[] {
	if (rateTable.baseCurrencyCode) {
		return createDirectFetchedRates(baseCurrencyCode, rateTable);
	}

	return createPhpEquivalentFetchedRates(baseCurrencyCode, rateTable);
}

function createPhpEquivalentFetchedRates(
	baseCurrencyCode: string,
	rateTable: RateTable,
) {
	const basePhpEquivalent = rateTable.ratesByCurrency.get(baseCurrencyCode);

	if (!basePhpEquivalent) {
		return [];
	}

	const rates: MultiCurrencyFetchedRate[] = [
		createFetchedRate({
			baseCurrencyCode,
			exchangeRate: 1,
			rateAsOf: rateTable.date,
			source: rateTable.source,
			targetCurrencyCode: baseCurrencyCode,
		}),
	];

	rateTable.ratesByCurrency.forEach((quotePhpEquivalent, quoteCurrencyCode) => {
		if (quoteCurrencyCode === baseCurrencyCode || quotePhpEquivalent <= 0) {
			return;
		}

		rates.push(
			createFetchedRate({
				baseCurrencyCode,
				exchangeRate: basePhpEquivalent / quotePhpEquivalent,
				rateAsOf: rateTable.date,
				source: rateTable.source,
				targetCurrencyCode: quoteCurrencyCode,
			}),
		);
	});

	return rates;
}

function createDirectFetchedRates(
	baseCurrencyCode: string,
	rateTable: RateTable,
) {
	const rates: MultiCurrencyFetchedRate[] = [
		createFetchedRate({
			baseCurrencyCode,
			exchangeRate: 1,
			rateAsOf: rateTable.date,
			source: rateTable.source,
			targetCurrencyCode: baseCurrencyCode,
		}),
	];

	rateTable.ratesByCurrency.forEach((exchangeRate, targetCurrencyCode) => {
		if (targetCurrencyCode === baseCurrencyCode || exchangeRate <= 0) {
			return;
		}

		rates.push(
			createFetchedRate({
				baseCurrencyCode,
				exchangeRate,
				rateAsOf: rateTable.date,
				source: rateTable.source,
				targetCurrencyCode,
			}),
		);
	});

	return rates;
}

function createFetchedRate({
	baseCurrencyCode,
	exchangeRate,
	rateAsOf,
	source,
	targetCurrencyCode,
}: {
	baseCurrencyCode: string;
	exchangeRate: number;
	rateAsOf: string;
	source: string;
	targetCurrencyCode: string;
}): MultiCurrencyFetchedRate {
	return {
		baseCurrencyCode,
		baseOriginalExchangeRate: 1,
		exchangeRate,
		inverseExchangeRate: exchangeRate === 0 ? 0 : 1 / exchangeRate,
		rateAsOf,
		source,
		targetCurrencyCode,
		targetCurrencyName: getCurrencyName(targetCurrencyCode),
		targetCurrencySymbol: getCurrencySymbol(targetCurrencyCode),
	};
}

async function fetchBspRateTable(): Promise<RateTable> {
	let lastError: unknown;

	for (const url of BspRerbUrls) {
		try {
			return await fetchBspRateTableFromUrl(url);
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError instanceof Error
		? lastError
		: new Error("BSP exchange rates are unavailable.");
}

async function fetchBspRateTableFromUrl(url: string): Promise<RateTable> {
	const response = await fetch(url, {
		headers: {
			Accept:
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		},
		next: { revalidate: 60 * 60 },
	});

	if (!response.ok) {
		throw new Error(`BSP returned ${response.status}.`);
	}

	const ExcelJS = (await import("exceljs")).default;
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(await response.arrayBuffer());

	const worksheet = workbook.getWorksheet("RERB") ?? workbook.worksheets[0];
	const ratesByCurrency = new Map<string, number>([["PHP", 1]]);
	const date = parseBspDate(String(worksheet.getCell("A4").text || ""));

	worksheet.eachRow((row) => {
		const currencyCode = String(row.getCell(4).text || "").trim().toUpperCase();
		const phpEquivalent = parseNumericCell(row.getCell(7).value);

		if (
			/^[A-Z]{3}$/.test(currencyCode) &&
			Number.isFinite(phpEquivalent) &&
			phpEquivalent > 0
		) {
			ratesByCurrency.set(currencyCode, phpEquivalent);
		}
	});

	return {
		date,
		ratesByCurrency,
		source: "BSP RERB",
	};
}

async function fetchFallbackRateTable(
	baseCurrencyCode: string,
): Promise<RateTable> {
	try {
		return await fetchFrankfurterRateTable(baseCurrencyCode);
	} catch {
		return fetchOpenExchangeRateTable(baseCurrencyCode);
	}
}

async function fetchFrankfurterRateTable(
	baseCurrencyCode: string,
): Promise<RateTable> {
	const response = await fetch(
		`${FrankfurterExchangeRateUrl}?from=${encodeURIComponent(baseCurrencyCode)}`,
		{
			headers: { Accept: "application/json" },
			next: { revalidate: 60 * 60 },
		},
	);

	if (!response.ok) {
		throw new Error(`Fallback provider returned ${response.status}.`);
	}

	const payload = (await response.json()) as {
		base?: string;
		date?: string;
		rates?: Record<string, number>;
	};
	const ratesByCurrency = new Map<string, number>();

	Object.entries(payload.rates ?? {}).forEach(([currencyCode, rate]) => {
		if (/^[A-Z]{3}$/.test(currencyCode) && Number.isFinite(rate) && rate > 0) {
			ratesByCurrency.set(currencyCode, rate);
		}
	});

	return {
		baseCurrencyCode: payload.base ?? baseCurrencyCode,
		date: payload.date ?? new Date().toISOString().slice(0, 10),
		ratesByCurrency,
		source: "Frankfurter",
	};
}

async function fetchOpenExchangeRateTable(
	baseCurrencyCode: string,
): Promise<RateTable> {
	const response = await fetch(
		`${OpenExchangeRateUrl}/${encodeURIComponent(baseCurrencyCode)}`,
		{
			headers: { Accept: "application/json" },
			next: { revalidate: 60 * 60 },
		},
	);

	if (!response.ok) {
		throw new Error(`Open exchange-rate provider returned ${response.status}.`);
	}

	const payload = (await response.json()) as {
		base_code?: string;
		rates?: Record<string, number>;
		result?: string;
		time_last_update_utc?: string;
	};

	if (payload.result && payload.result !== "success") {
		throw new Error("Open exchange-rate provider returned an error.");
	}

	const ratesByCurrency = new Map<string, number>();

	Object.entries(payload.rates ?? {}).forEach(([currencyCode, rate]) => {
		if (/^[A-Z]{3}$/.test(currencyCode) && Number.isFinite(rate) && rate > 0) {
			ratesByCurrency.set(currencyCode, rate);
		}
	});

	return {
		baseCurrencyCode: payload.base_code ?? baseCurrencyCode,
		date: parseProviderDate(payload.time_last_update_utc),
		ratesByCurrency,
		source: "Open ER API",
	};
}

function parseNumericCell(value: unknown) {
	if (typeof value === "number") {
		return value;
	}

	if (typeof value === "string") {
		const parsedValue = Number(value.replaceAll(",", ""));

		return Number.isFinite(parsedValue) ? parsedValue : NaN;
	}

	return NaN;
}

function parseBspDate(value: string) {
	const dateParts = value
		.trim()
		.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);

	if (dateParts) {
		const [, day, monthName, year] = dateParts;
		const month = getMonthNumber(monthName);

		if (month) {
			return `${year}-${month}-${day.padStart(2, "0")}`;
		}
	}

	const parsedTimestamp = Date.parse(`${value} UTC`);

	if (Number.isFinite(parsedTimestamp)) {
		return new Date(parsedTimestamp).toISOString().slice(0, 10);
	}

	return new Date().toISOString().slice(0, 10);
}

function parseProviderDate(value?: string) {
	if (!value) {
		return new Date().toISOString().slice(0, 10);
	}

	const parsedTimestamp = Date.parse(value);

	if (Number.isFinite(parsedTimestamp)) {
		return new Date(parsedTimestamp).toISOString().slice(0, 10);
	}

	return new Date().toISOString().slice(0, 10);
}

function getMonthNumber(monthName: string) {
	const monthIndex = [
		"january",
		"february",
		"march",
		"april",
		"may",
		"june",
		"july",
		"august",
		"september",
		"october",
		"november",
		"december",
	].indexOf(monthName.toLowerCase());

	return monthIndex >= 0 ? String(monthIndex + 1).padStart(2, "0") : null;
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
