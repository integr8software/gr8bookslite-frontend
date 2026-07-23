import {
	TermImportDefaultColumnIndexes,
	TermImportMaxFileSizeBytes,
	TermImportMinFileSizeBytes,
	TermImportTemplateHeaders,
	TermManagementDatemodeOptions,
} from "@/app/src/constants/modules/financial-maintenance/term-management/TermManagementConstants";
import type {
	TermImportCellErrors,
	TermImportCellWarnings,
	TermImportColumnId,
	TermImportPreviewRow,
	TermManagement,
	TermManagementDatemode,
	TermManagementFormValues,
} from "@/app/src/types/modules/financial-maintenance/term-management/TermManagementTypes";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { formatFileSize } from "@/app/src/utils/file.util";
import { isModuleImportOptionValue } from "@/app/src/utils/module-import-validation.util";

export const TermManagementInitialFormValues: TermManagementFormValues = {
	name: "",
	description: "",
	datemode: "Month",
	period: "",
	status: "Active",
};

export function createTermManagementFormValues(
	term: TermManagement,
): TermManagementFormValues {
	const legacyTerm = term as TermManagement & { description?: string };

	return {
		name: term.name ?? legacyTerm.description ?? "",
		description: term.description ?? "",
		datemode: term.datemode,
		period: term.period,
		status: term.status ?? "Active",
	};
}

export function createTermManagementFromForm(
	values: TermManagementFormValues,
): TermManagement {
	return {
		id: `term-${Date.now()}`,
		name: values.name.trim(),
		description: values.description.trim(),
		datemode: values.datemode,
		period: values.period.trim(),
		status: values.status,
	};
}

export function updateTermManagementFromForm(
	term: TermManagement,
	values: TermManagementFormValues,
): TermManagement {
	return {
		...term,
		name: values.name.trim(),
		description: values.description.trim(),
		datemode: values.datemode,
		period: values.period.trim(),
		status: values.status,
	};
}

export function createExistingTermNameMap(terms: TermManagement[]) {
	return new Map(
		terms.map((term) => [normalizeTermName(term.name), term.name]),
	);
}

export function createBlankImportRow(rowNumber: number): TermImportPreviewRow {
	return {
		cellErrors: {},
		cellWarnings: {},
		id: `term-import-preview-${rowNumber}-${Date.now()}`,
		rowErrors: [],
		rowNumber,
		term: {
			name: "",
			description: "",
			datemode: "Month",
			period: "",
			status: "Active",
		},
	};
}

export function renumberImportRows(rows: TermImportPreviewRow[]) {
	return rows.map((row, index) => ({
		...row,
		rowNumber: index + 1,
	}));
}

export function removeDuplicateImportRows(
	rows: TermImportPreviewRow[],
	baseRows: TermImportPreviewRow[],
) {
	const seenNames = new Set(
		baseRows.map((row) => normalizeTermName(row.term.name)).filter(Boolean),
	);
	const uniqueRows: TermImportPreviewRow[] = [];
	let skippedCount = 0;

	rows.forEach((row) => {
		const normalizedName = normalizeTermName(row.term.name);

		if (normalizedName && seenNames.has(normalizedName)) {
			skippedCount += 1;
			return;
		}

		if (normalizedName) {
			seenNames.add(normalizedName);
		}
		uniqueRows.push(row);
	});

	return {
		rows: uniqueRows,
		skippedCount,
	};
}

export function getNextImportRowNumber(rows: TermImportPreviewRow[]) {
	return Math.max(0, ...rows.map((row) => row.rowNumber)) + 1;
}

export function normalizeImportedCellValue(
	field: TermImportColumnId,
	value: string,
) {
	if (field === "datemode") {
		return normalizeImportedDatemode(value);
	}

	return value;
}

export function isTabularPaste(text: string) {
	return text.includes("\t") || text.includes("\n") || text.includes("\r");
}

export async function downloadTermImportTemplate() {
	try {
		const ExcelJS = await import("exceljs");
		const workbook = new ExcelJS.default.Workbook();
		const worksheet = workbook.addWorksheet("Terms");

		worksheet.addRow(TermImportTemplateHeaders);
		for (let rowNumber = 2; rowNumber <= 101; rowNumber += 1) {
			worksheet.getCell(`B${rowNumber}`).dataValidation = {
				allowBlank: false,
				formulae: [`"${TermManagementDatemodeOptions.join(",")}"`],
				showErrorMessage: true,
				type: "list",
			};
		}
		worksheet.columns = [{ width: 28 }, { width: 14 }, { width: 12 }];

		const buffer = await workbook.xlsx.writeBuffer();

		downloadBlob(
			new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			}),
			"term-management-import-template.xlsx",
		);
	} catch {
		downloadBlob(
			new Blob([createTermImportTemplateCsv()], {
				type: "text/csv;charset=utf-8",
			}),
			"term-management-import-template.csv",
		);
	}
}

function createTermImportTemplateCsv() {
	return [TermImportTemplateHeaders]
		.map((row) =>
			row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
		)
		.join("\n");
}

export async function readTermImportFileText(file: File) {
	const fileName = file.name.toLowerCase();

	if (fileName.endsWith(".xlsx")) {
		const rows = await readTermImportXlsxRows(await file.arrayBuffer());

		return formatTermImportRowsAsText(rows);
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

async function readTermImportXlsxRows(buffer: ArrayBuffer) {
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
			cells[columnNumber - 1] = formatTermImportExcelCellValue(
				cell.value,
				cell.text,
			);
		});
		rows.push(cells);
	});

	return rows;
}

export function parseTermImportText(
	text: string,
	startRowNumber = 1,
): TermImportPreviewRow[] {
	const rows = parseTermImportTabularRows(text).filter((row) =>
		row.some((cell) => cell.trim() !== ""),
	);

	if (rows.length === 0) {
		return [];
	}

	const headerIndexes = getTermImportHeaderIndexes(rows[0]);
	const indexes = headerIndexes ?? TermImportDefaultColumnIndexes;
	const dataRows = headerIndexes ? rows.slice(1) : rows;
	const importBatchId = Date.now();

	return dataRows
		.filter((row) => row.some((cell) => cell.trim() !== ""))
		.map((row, index) => {
			const rowNumber = startRowNumber + index;
			const term = {
				name: getImportedTermValue(row, indexes.name),
				description: "",
				datemode: normalizeImportedDatemode(
					getImportedTermValue(row, indexes.datemode),
				),
				period: getImportedTermValue(row, indexes.period),
				status: "Active" as const,
			};

			return {
				cellErrors: {},
				cellWarnings: {},
				id: `term-import-preview-${rowNumber}-${importBatchId}-${index}`,
				rowErrors: [],
				rowNumber,
				term,
			};
		});
}

export function validateTermImportRows(
	rows: TermImportPreviewRow[],
	existingTermNames: Map<string, string>,
) {
	const importedNameCounts = new Map<string, number>();

	rows.forEach((row) => {
		const normalizedName = normalizeTermName(row.term.name);

		if (normalizedName) {
			importedNameCounts.set(
				normalizedName,
				(importedNameCounts.get(normalizedName) ?? 0) + 1,
			);
		}
	});

	return rows.map((row) => {
		const cellErrors: TermImportCellErrors = {};
		const cellWarnings: TermImportCellWarnings = {};
		const rowErrors: string[] = [];
		const normalizedName = normalizeTermName(row.term.name);
		const periodNumber = Number(row.term.period);

		if (!row.term.name.trim()) {
			cellErrors.name = ["Name is required."];
		}

		const existingTermName = existingTermNames.get(normalizedName);

		if (existingTermName) {
			cellErrors.name = [
				...(cellErrors.name ?? []),
				`Term already exists: ${existingTermName}.`,
			];
		}

		if (!row.term.datemode.trim()) {
			cellErrors.datemode = ["Datemode is required. Choose a value from the list."];
		} else if (!isModuleImportOptionValue(row.term.datemode, TermManagementDatemodeOptions)) {
			cellErrors.datemode = ["Choose Day, Month, or Year from the list."];
		}

		if (
			!row.term.period.trim() ||
			!Number.isFinite(periodNumber) ||
			periodNumber < 0
		) {
			cellErrors.period = ["Period must be 0 or greater."];
		} else if (!Number.isInteger(periodNumber)) {
			cellErrors.period = ["Period must be a whole number."];
		} else if (periodNumber === 0) {
			cellWarnings.period = [
				"Period is 0. Import only if this term should not add time.",
			];
		}

		if (normalizedName && (importedNameCounts.get(normalizedName) ?? 0) > 1) {
			cellErrors.name = [
				...(cellErrors.name ?? []),
				"Duplicate name in import.",
			];
		}

		return { ...row, cellErrors, cellWarnings, rowErrors };
	});
}

export function rowHasErrors(row: TermImportPreviewRow) {
	return (
		row.rowErrors.length > 0 ||
		Object.values(row.cellErrors).some((errors) => Boolean(errors?.length))
	);
}

export function validateImportFileSize(file: File) {
	if (file.size < TermImportMinFileSizeBytes) {
		return `Upload a file larger than ${formatFileSize(TermImportMinFileSizeBytes)}.`;
	}

	if (file.size > TermImportMaxFileSizeBytes) {
		return `Upload a file up to ${formatFileSize(TermImportMaxFileSizeBytes)}.`;
	}

	return null;
}

export function isTermImportGridPasteTarget(target: EventTarget | null) {
	return !(
		target instanceof HTMLInputElement ||
		target instanceof HTMLSelectElement ||
		target instanceof HTMLTextAreaElement
	);
}

export function getTermManagementTableMinWidthClassName(
	visibleColumnCount: number,
) {
	if (visibleColumnCount >= 10) return "min-w-[136rem]";
	if (visibleColumnCount === 9) return "min-w-[122rem]";
	if (visibleColumnCount === 8) return "min-w-[108rem]";
	if (visibleColumnCount === 7) return "min-w-[94rem]";
	if (visibleColumnCount === 6) return "min-w-[80rem]";
	return "min-w-[64rem]";
}

export function parseTermImportTabularRows(text: string) {
	const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

	return normalizedText.includes("\t")
		? normalizedText
				.split("\n")
				.map((line) => line.split("\t").map((cell) => cell.trim()))
		: parseTermImportCsvRows(normalizedText);
}

function parseTermImportCsvRows(text: string) {
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

function getTermImportHeaderIndexes(row: string[]) {
	const indexes: Partial<Record<TermImportColumnId, number>> = {};

	row.forEach((cell, index) => {
		const key = normalizeTermImportHeader(cell);

		if (key) {
			indexes[key] = index;
		}
	});

	return Object.keys(indexes).length >= 2 ? indexes : null;
}

function normalizeTermImportHeader(value: string): TermImportColumnId | null {
	const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

	if (["name", "term", "termname"].includes(normalized)) {
		return "name";
	}

	if (["datemode", "datebasis", "mode"].includes(normalized)) {
		return "datemode";
	}

	if (["period", "termperiod", "duration"].includes(normalized)) {
		return "period";
	}

	return null;
}

function getImportedTermValue(row: string[], index?: number) {
	return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

export function normalizeImportedDatemode(
	value: string,
): TermManagementDatemode {
	const normalized = value.trim().toLowerCase();

	if (normalized === "day" || normalized === "days") {
		return "Day";
	}

	if (normalized === "month" || normalized === "months") {
		return "Month";
	}

	if (normalized === "year" || normalized === "years") {
		return "Year";
	}

	return value as TermManagementDatemode;
}

export function normalizeTermName(value: string) {
	return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function formatTermImportRowsAsText(rows: string[][]) {
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

function formatTermImportExcelCellValue(value: unknown, displayText?: string) {
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
			return formatTermImportExcelCellValue(record.result);
		}
	}

	return String(value).replace(/\r?\n/g, " ").trim();
}

export function waitForNextImportBatch() {
	return new Promise<void>((resolve) => {
		window.setTimeout(resolve, 75);
	});
}

