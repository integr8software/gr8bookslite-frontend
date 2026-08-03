import type {
	UnitOfMeasurementImportCellErrors,
	UnitOfMeasurementImportCellWarnings,
	UnitOfMeasurementImportColumnId,
	UnitOfMeasurementImportPreviewRow,
	UnitOfMeasurementFormValues,
	UnitOfMeasurementQuantityMode,
	UnitOfMeasurementRecord,
} from "@/app/src/types/modules/item-management/unit-of-measurement/UnitOfMeasurementTypes";
import {
	UnitOfMeasurementImportDefaultColumnIndexes,
	UnitOfMeasurementImportMaxFileSizeBytes,
	UnitOfMeasurementImportMinFileSizeBytes,
	UnitOfMeasurementImportTemplateHeaders,
	UnitOfMeasurementQuantityModeOptions,
} from "@/app/src/constants/modules/item-management/unit-of-measurement/UnitOfMeasurementConstants";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { formatFileSize } from "@/app/src/utils/file.util";
import { normalizeLowercaseWhitespace } from "@/app/src/utils/string.util";
import { isModuleImportOptionValue } from "@/app/src/utils/module-import.util";

export function createUnitOfMeasurementFormValues(
	record?: UnitOfMeasurementRecord,
): UnitOfMeasurementFormValues {
	return {
		name: record?.name ?? "",
		symbol: record?.symbol ?? "",
		quantityMode: record?.quantityMode ?? "Integer",
		status: record?.status ?? "Active",
	};
}

export function getUnitOfMeasurementTableMinWidthClassName(
	visibleColumnCount: number,
) {
	if (visibleColumnCount >= 9) return "min-w-[126rem]";
	if (visibleColumnCount === 8) return "min-w-[112rem]";
	if (visibleColumnCount === 7) return "min-w-[98rem]";
	if (visibleColumnCount === 6) return "min-w-[84rem]";
	return "min-w-[64rem]";
}

export function createExistingUnitOfMeasurementMaps(
	records: UnitOfMeasurementRecord[],
) {
	return {
		names: new Map(
			records.map((record) => [
				normalizeUnitOfMeasurementName(record.name),
				record.name,
			]),
		),
		symbols: new Map(
			records.map((record) => [
				normalizeUnitOfMeasurementSymbol(record.symbol),
				record.symbol,
			]),
		),
	};
}

export function createBlankUnitOfMeasurementImportRow(
	rowNumber: number,
): UnitOfMeasurementImportPreviewRow {
	return {
		cellErrors: {},
		cellWarnings: {},
		id: `uom-import-preview-${rowNumber}-${Date.now()}`,
		rowErrors: [],
		rowNumber,
		record: {
			name: "",
			symbol: "",
			quantityMode: "Integer",
			status: "Active",
		},
	};
}

export function renumberUnitOfMeasurementImportRows(
	rows: UnitOfMeasurementImportPreviewRow[],
) {
	return rows.map((row, index) => ({
		...row,
		rowNumber: index + 1,
	}));
}

export function removeDuplicateUnitOfMeasurementImportRows(
	rows: UnitOfMeasurementImportPreviewRow[],
	baseRows: UnitOfMeasurementImportPreviewRow[],
) {
	const seenNames = new Set(
		baseRows
			.map((row) => normalizeUnitOfMeasurementName(row.record.name))
			.filter(Boolean),
	);
	const seenSymbols = new Set(
		baseRows
			.map((row) => normalizeUnitOfMeasurementSymbol(row.record.symbol))
			.filter(Boolean),
	);
	const uniqueRows: UnitOfMeasurementImportPreviewRow[] = [];
	let skippedCount = 0;

	rows.forEach((row) => {
		const normalizedName = normalizeUnitOfMeasurementName(row.record.name);
		const normalizedSymbol = normalizeUnitOfMeasurementSymbol(row.record.symbol);
		const isDuplicate =
			(Boolean(normalizedName) && seenNames.has(normalizedName)) ||
			(Boolean(normalizedSymbol) && seenSymbols.has(normalizedSymbol));

		if (isDuplicate) {
			skippedCount += 1;
			return;
		}

		if (normalizedName) {
			seenNames.add(normalizedName);
		}
		if (normalizedSymbol) {
			seenSymbols.add(normalizedSymbol);
		}
		uniqueRows.push(row);
	});

	return { rows: uniqueRows, skippedCount };
}

export function getNextUnitOfMeasurementImportRowNumber(
	rows: UnitOfMeasurementImportPreviewRow[],
) {
	return Math.max(0, ...rows.map((row) => row.rowNumber)) + 1;
}

export function normalizeImportedUnitOfMeasurementCellValue(
	field: UnitOfMeasurementImportColumnId,
	value: string,
) {
	if (field === "quantityMode") {
		return normalizeImportedUnitOfMeasurementQuantityMode(value);
	}

	if (field === "symbol") {
		return value.trim().toUpperCase();
	}

	return value;
}

export async function downloadUnitOfMeasurementImportTemplate() {
	try {
		const ExcelJS = await import("exceljs");
		const workbook = new ExcelJS.default.Workbook();
		const worksheet = workbook.addWorksheet("Units of Measurement");

		worksheet.addRow(UnitOfMeasurementImportTemplateHeaders);
		for (let rowNumber = 2; rowNumber <= 101; rowNumber += 1) {
			worksheet.getCell(`C${rowNumber}`).dataValidation = {
				allowBlank: false,
				formulae: [
					`"${UnitOfMeasurementQuantityModeOptions.map((option) => option.value).join(",")}"`,
				],
				showErrorMessage: true,
				type: "list",
			};
		}
		worksheet.columns = [{ width: 30 }, { width: 16 }, { width: 18 }];

		const buffer = await workbook.xlsx.writeBuffer();

		downloadBlob(
			new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			}),
			"unit-of-measurement-import-template.xlsx",
		);
	} catch {
		downloadBlob(
			new Blob([createUnitOfMeasurementImportTemplateCsv()], {
				type: "text/csv;charset=utf-8",
			}),
			"unit-of-measurement-import-template.csv",
		);
	}
}

function createUnitOfMeasurementImportTemplateCsv() {
	return [UnitOfMeasurementImportTemplateHeaders]
		.map((row) =>
			row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
		)
		.join("\n");
}

export async function readUnitOfMeasurementImportFileText(file: File) {
	const fileName = file.name.toLowerCase();

	if (fileName.endsWith(".xlsx")) {
		const rows = await readUnitOfMeasurementImportXlsxRows(
			await file.arrayBuffer(),
		);

		return formatUnitOfMeasurementImportRowsAsText(rows);
	}

	if (
		fileName.endsWith(".csv") ||
		fileName.endsWith(".tsv") ||
		fileName.endsWith(".txt")
	) {
		return (await file.text()).trim();
	}

	throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

async function readUnitOfMeasurementImportXlsxRows(buffer: ArrayBuffer) {
	const ExcelJS = await import("exceljs");
	const workbook = new ExcelJS.default.Workbook();

	await workbook.xlsx.load(buffer);

	const worksheet = workbook.worksheets[0];

	if (!worksheet) {
		throw new Error("No worksheet was found in the Excel file.");
	}

	const rows: string[][] = [];

	worksheet.eachRow({ includeEmpty: false }, (row) => {
		const cells: string[] = [];

		row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
			cells[columnNumber - 1] = formatUnitOfMeasurementImportExcelCellValue(
				cell.value,
				cell.text,
			);
		});
		rows.push(cells);
	});

	return rows;
}

export function parseUnitOfMeasurementImportText(
	text: string,
	startRowNumber = 1,
): UnitOfMeasurementImportPreviewRow[] {
	const rows = parseUnitOfMeasurementImportTabularRows(text).filter((row) =>
		row.some((cell) => cell.trim() !== ""),
	);

	if (rows.length === 0) {
		return [];
	}

	const headerIndexes = getUnitOfMeasurementImportHeaderIndexes(rows[0]);
	const indexes = headerIndexes ?? UnitOfMeasurementImportDefaultColumnIndexes;
	const dataRows = headerIndexes ? rows.slice(1) : rows;
	const importBatchId = Date.now();

	return dataRows
		.filter((row) => row.some((cell) => cell.trim() !== ""))
		.map((row, index) => {
			const rowNumber = startRowNumber + index;

			return {
				cellErrors: {},
				cellWarnings: {},
				id: `uom-import-preview-${rowNumber}-${importBatchId}-${index}`,
				rowErrors: [],
				rowNumber,
				record: {
					name: getImportedUnitOfMeasurementValue(row, indexes.name),
					symbol: getImportedUnitOfMeasurementValue(
						row,
						indexes.symbol,
					).toUpperCase(),
					quantityMode: normalizeImportedUnitOfMeasurementQuantityMode(
						getImportedUnitOfMeasurementValue(row, indexes.quantityMode),
					),
					status: "Active",
				},
			};
		});
}

export function validateUnitOfMeasurementImportRows(
	rows: UnitOfMeasurementImportPreviewRow[],
	existingRecords: ReturnType<typeof createExistingUnitOfMeasurementMaps>,
) {
	const importedNameCounts = new Map<string, number>();
	const importedSymbolCounts = new Map<string, number>();

	rows.forEach((row) => {
		const normalizedName = normalizeUnitOfMeasurementName(row.record.name);
		const normalizedSymbol = normalizeUnitOfMeasurementSymbol(row.record.symbol);

		if (normalizedName) {
			importedNameCounts.set(
				normalizedName,
				(importedNameCounts.get(normalizedName) ?? 0) + 1,
			);
		}
		if (normalizedSymbol) {
			importedSymbolCounts.set(
				normalizedSymbol,
				(importedSymbolCounts.get(normalizedSymbol) ?? 0) + 1,
			);
		}
	});

	return rows.map((row) => {
		const cellErrors: UnitOfMeasurementImportCellErrors = {};
		const cellWarnings: UnitOfMeasurementImportCellWarnings = {};
		const rowErrors: string[] = [];
		const normalizedName = normalizeUnitOfMeasurementName(row.record.name);
		const normalizedSymbol = normalizeUnitOfMeasurementSymbol(row.record.symbol);
		const existingName = existingRecords.names.get(normalizedName);
		const existingSymbol = existingRecords.symbols.get(normalizedSymbol);

		if (!row.record.name.trim()) {
			cellErrors.name = ["Unit of measurement is required."];
		}

		if (existingName) {
			cellErrors.name = [
				...(cellErrors.name ?? []),
				`Unit already exists: ${existingName}.`,
			];
		}

		if (!row.record.symbol.trim()) {
			cellErrors.symbol = ["Symbol is required."];
		}

		if (existingSymbol) {
			cellErrors.symbol = [
				...(cellErrors.symbol ?? []),
				`Symbol already exists: ${existingSymbol}.`,
			];
		}

		if (!isModuleImportOptionValue(
			row.record.quantityMode,
			UnitOfMeasurementQuantityModeOptions.map((option) => option.value),
		)) {
			cellErrors.quantityMode = [
				"Quantity type must be Integer or Float.",
			];
		}

		if (
			normalizedName &&
			(importedNameCounts.get(normalizedName) ?? 0) > 1
		) {
			cellErrors.name = [
				...(cellErrors.name ?? []),
				"Duplicate unit in import.",
			];
		}

		if (
			normalizedSymbol &&
			(importedSymbolCounts.get(normalizedSymbol) ?? 0) > 1
		) {
			cellErrors.symbol = [
				...(cellErrors.symbol ?? []),
				"Duplicate symbol in import.",
			];
		}

		return { ...row, cellErrors, cellWarnings, rowErrors };
	});
}

export function unitOfMeasurementImportRowHasErrors(
	row: UnitOfMeasurementImportPreviewRow,
) {
	return (
		row.rowErrors.length > 0 ||
		Object.values(row.cellErrors).some((errors) => Boolean(errors?.length))
	);
}

export function validateUnitOfMeasurementImportFileSize(file: File) {
	if (file.size < UnitOfMeasurementImportMinFileSizeBytes) {
		return `Upload a file larger than ${formatFileSize(UnitOfMeasurementImportMinFileSizeBytes)}.`;
	}

	if (file.size > UnitOfMeasurementImportMaxFileSizeBytes) {
		return `Upload a file up to ${formatFileSize(UnitOfMeasurementImportMaxFileSizeBytes)}.`;
	}

	return null;
}

export function isUnitOfMeasurementImportGridPasteTarget(
	target: EventTarget | null,
) {
	return !(
		target instanceof HTMLInputElement ||
		target instanceof HTMLSelectElement ||
		target instanceof HTMLTextAreaElement
	);
}

export function parseUnitOfMeasurementImportTabularRows(text: string) {
	const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

	return normalizedText.includes("\t")
		? normalizedText
				.split("\n")
				.map((line) => line.split("\t").map((cell) => cell.trim()))
		: parseUnitOfMeasurementImportCsvRows(normalizedText);
}

function parseUnitOfMeasurementImportCsvRows(text: string) {
	const rows: string[][] = [];
	let cell = "";
	let row: string[] = [];
	let isQuoted = false;

	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		const nextChar = text[index + 1];

		if (char === '"' && isQuoted && nextChar === '"') {
			cell += '"';
			index += 1;
			continue;
		}

		if (char === '"') {
			isQuoted = !isQuoted;
			continue;
		}

		if (char === "," && !isQuoted) {
			row.push(cell.trim());
			cell = "";
			continue;
		}

		if (char === "\n" && !isQuoted) {
			row.push(cell.trim());
			rows.push(row);
			row = [];
			cell = "";
			continue;
		}

		cell += char;
	}

	row.push(cell.trim());
	rows.push(row);

	return rows;
}

function getUnitOfMeasurementImportHeaderIndexes(row: string[]) {
	const indexes: Partial<Record<UnitOfMeasurementImportColumnId, number>> = {};

	row.forEach((cell, index) => {
		const key = normalizeUnitOfMeasurementImportHeader(cell);

		if (key) {
			indexes[key] = index;
		}
	});

	return Object.keys(indexes).length >= 2 ? indexes : null;
}

function normalizeUnitOfMeasurementImportHeader(
	value: string,
): UnitOfMeasurementImportColumnId | null {
	const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

	if (["name", "unit", "uom", "unitofmeasurement"].includes(normalized)) {
		return "name";
	}

	if (["symbol", "code", "uomcode"].includes(normalized)) {
		return "symbol";
	}

	if (
		["quantitymode", "quantitytype", "type", "kind", "quantitykind"].includes(
			normalized,
		)
	) {
		return "quantityMode";
	}

	return null;
}

function getImportedUnitOfMeasurementValue(row: string[], index?: number) {
	return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

export function normalizeImportedUnitOfMeasurementQuantityMode(
	value: string,
): UnitOfMeasurementQuantityMode {
	const normalized = value.trim().toLowerCase().replace(/[^a-z]/g, "");

	if (
		["integer", "int", "whole", "wholenumber", "wholenumberquantities"].includes(
			normalized,
		)
	) {
		return "Integer";
	}

	if (
		["float", "decimal", "decimals", "decimalquantities"].includes(normalized)
	) {
		return "Float";
	}

	return value as UnitOfMeasurementQuantityMode;
}

export function normalizeUnitOfMeasurementName(value: string) {
	return normalizeLowercaseWhitespace(value);
}

export function normalizeUnitOfMeasurementSymbol(value: string) {
	return value.trim().replace(/\s+/g, "").toUpperCase();
}

function formatUnitOfMeasurementImportRowsAsText(rows: string[][]) {
	return rows
		.filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
		.map((row) =>
			row
				.map((cell) =>
					String(cell ?? "")
						.replace(/\r?\n/g, " ")
						.trim(),
				)
				.join("\t"),
		)
		.join("\n");
}

function formatUnitOfMeasurementImportExcelCellValue(
	value: unknown,
	displayText?: string,
) {
	const normalizedDisplayText = String(displayText ?? "")
		.replace(/\r?\n/g, " ")
		.trim();

	if (normalizedDisplayText) {
		return normalizedDisplayText;
	}

	if (value == null) {
		return "";
	}

	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}

	if (typeof value === "object" && value !== null) {
		const record = value as Record<string, unknown>;

		if (Array.isArray(record.richText)) {
			return record.richText
				.map((part) =>
					typeof part === "object" && part !== null
						? String((part as Record<string, unknown>).text ?? "")
						: "",
				)
				.join("")
				.replace(/\r?\n/g, " ")
				.trim();
		}

		if ("text" in record) {
			return String(record.text ?? "")
				.replace(/\r?\n/g, " ")
				.trim();
		}

		if ("result" in record) {
			return formatUnitOfMeasurementImportExcelCellValue(record.result);
		}
	}

	return String(value).replace(/\r?\n/g, " ").trim();
}

export function waitForNextUnitOfMeasurementImportBatch() {
	return new Promise<void>((resolve) => {
		window.setTimeout(resolve, 75);
	});
}
