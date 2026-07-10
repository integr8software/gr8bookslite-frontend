import { MultiCurrencyCatalog } from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import type { MultiCurrencyFetchedRate } from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

export const runtime = "nodejs";

const BspRerbUrl = "https://www.bsp.gov.ph/Statistics/RERB/RERB.xlsx";

type BspRateTable = {
	date: string;
	phpEquivalentByCurrency: Map<string, number>;
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

	try {
		const bspRateTable = await fetchBspRateTable();
		const basePhpEquivalent = bspRateTable.phpEquivalentByCurrency.get(
			baseCurrency.code,
		);

		if (!basePhpEquivalent) {
			return Response.json(
				{ message: "The selected base currency is unavailable from BSP." },
				{ status: 422 },
			);
		}

		const rates: MultiCurrencyFetchedRate[] = [
			{
				baseCurrencyCode: baseCurrency.code,
				baseOriginalExchangeRate: 1,
				exchangeRate: 1,
				inverseExchangeRate: 1,
				rateAsOf: bspRateTable.date,
				targetCurrencyCode: baseCurrency.code,
			},
			...quoteCurrencies.flatMap((quoteCurrency) => {
				const quotePhpEquivalent =
					bspRateTable.phpEquivalentByCurrency.get(quoteCurrency);

				if (!quotePhpEquivalent) {
					return [];
				}

				const exchangeRate = basePhpEquivalent / quotePhpEquivalent;

				return [
					{
						baseCurrencyCode: baseCurrency.code,
						baseOriginalExchangeRate: 1,
						exchangeRate,
						inverseExchangeRate: 1 / exchangeRate,
						rateAsOf: bspRateTable.date,
						targetCurrencyCode: quoteCurrency,
					},
				];
			}),
		];

		return Response.json(rates);
	} catch {
		return Response.json(
			{ message: "BSP exchange rates are temporarily unavailable." },
			{ status: 502 },
		);
	}
}

async function fetchBspRateTable(): Promise<BspRateTable> {
	const response = await fetch(BspRerbUrl, {
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
	const phpEquivalentByCurrency = new Map<string, number>([["PHP", 1]]);
	const date = parseBspDate(String(worksheet.getCell("A4").text || ""));

	worksheet.eachRow((row) => {
		const currencyCode = String(row.getCell(4).text || "").trim().toUpperCase();
		const phpEquivalent = parseNumericCell(row.getCell(7).value);

		if (
			/^[A-Z]{3}$/.test(currencyCode) &&
			Number.isFinite(phpEquivalent) &&
			phpEquivalent > 0
		) {
			phpEquivalentByCurrency.set(currencyCode, phpEquivalent);
		}
	});

	return {
		date,
		phpEquivalentByCurrency,
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
