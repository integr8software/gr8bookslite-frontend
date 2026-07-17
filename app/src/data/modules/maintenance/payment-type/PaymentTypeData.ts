import type {
	PaymentTypeClassification,
	PaymentTypeImportCellErrors,
	PaymentTypeImportCellWarnings,
	PaymentTypeImportColumnId,
	PaymentTypeImportPreviewRow,
	PaymentTypeFormValues,
	PaymentTypeRecord,
	PaymentTypeStatus,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";
import {
	PaymentTypeClassificationOptions,
	PaymentTypeImportDefaultColumnIndexes,
	PaymentTypeImportMaxFileSizeBytes,
	PaymentTypeImportMinFileSizeBytes,
	PaymentTypeImportTemplateHeaders,
} from "@/app/src/constants/modules/maintenance/payment-type/PaymentTypeConstants";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { formatFileSize } from "@/app/src/utils/file.util";

export const PaymentTypeOptions: PaymentTypeClassification[] = [
	"Cash",
	"Bank Transfer",
	"Check",
	"Digital Wallet",
	"Non-Cash Settlement",
];

export const PaymentTypeInitialFormValues: PaymentTypeFormValues = {
	description: "",
	paymentType: "",
	sortOrder: "0",
	status: "Active",
	type: "",
};

export function createPaymentTypeFormValues(
	record?: PaymentTypeRecord,
): PaymentTypeFormValues {
	if (!record) {
		return PaymentTypeInitialFormValues;
	}

	return {
		description: record.description,
		paymentType: record.paymentType,
		sortOrder: String(record.sortOrder),
		status: record.status,
		type: record.type,
	};
}

export function createPaymentTypeFromForm(
	values: PaymentTypeFormValues,
): PaymentTypeRecord {
	return {
		description: values.description.trim(),
		id: `payment-type-${Date.now()}`,
		paymentType: values.paymentType.trim(),
		sortOrder: normalizePaymentTypeSortOrder(values.sortOrder),
		status: values.status,
		type: values.type || "Cash",
	};
}

export function updatePaymentTypeFromForm(
	record: PaymentTypeRecord,
	values: PaymentTypeFormValues,
): PaymentTypeRecord {
	return {
		...record,
		description: values.description.trim(),
		paymentType: values.paymentType.trim(),
		sortOrder: normalizePaymentTypeSortOrder(values.sortOrder),
		status: values.status,
		type: values.type || record.type,
	};
}

export function createExistingPaymentTypeNameMap(
	paymentTypes: PaymentTypeRecord[],
) {
	return new Map(
		paymentTypes.map((paymentType) => [
			normalizePaymentTypeName(paymentType.paymentType),
			paymentType.paymentType,
		]),
	);
}

export function createBlankPaymentTypeImportRow(
	rowNumber: number,
): PaymentTypeImportPreviewRow {
	return {
		cellErrors: {},
		cellWarnings: {},
		id: `payment-type-import-preview-${rowNumber}-${Date.now()}`,
		rowErrors: [],
		rowNumber,
		paymentType: {
			description: "",
			paymentType: "",
			status: "Active",
			sortOrder: 0,
			type: "Cash",
		},
	};
}

export function renumberPaymentTypeImportRows(
	rows: PaymentTypeImportPreviewRow[],
) {
	return rows.map((row, index) => ({ ...row, rowNumber: index + 1 }));
}

export function removeDuplicatePaymentTypeImportRows(
	rows: PaymentTypeImportPreviewRow[],
	baseRows: PaymentTypeImportPreviewRow[],
) {
	const seenNames = new Set(
		baseRows
			.map((row) => normalizePaymentTypeName(row.paymentType.paymentType))
			.filter(Boolean),
	);
	const uniqueRows: PaymentTypeImportPreviewRow[] = [];
	let skippedCount = 0;

	rows.forEach((row) => {
		const normalizedName = normalizePaymentTypeName(row.paymentType.paymentType);

		if (normalizedName && seenNames.has(normalizedName)) {
			skippedCount += 1;
			return;
		}

		if (normalizedName) {
			seenNames.add(normalizedName);
		}
		uniqueRows.push(row);
	});

	return { rows: uniqueRows, skippedCount };
}

export function getNextPaymentTypeImportRowNumber(
	rows: PaymentTypeImportPreviewRow[],
) {
	return Math.max(0, ...rows.map((row) => row.rowNumber)) + 1;
}

export function normalizeImportedPaymentTypeCellValue(
	field: PaymentTypeImportColumnId,
	value: string,
) {
	if (field === "type") return normalizeImportedPaymentTypeClassification(value);

	return value;
}

export async function downloadPaymentTypeImportTemplate() {
	try {
		const ExcelJS = await import("exceljs");
		const workbook = new ExcelJS.default.Workbook();
		const worksheet = workbook.addWorksheet("Payment Types");

		worksheet.addRow(PaymentTypeImportTemplateHeaders);
		for (let rowNumber = 2; rowNumber <= 101; rowNumber += 1) {
			worksheet.getCell(`C${rowNumber}`).dataValidation = {
				allowBlank: false,
				formulae: [`"${PaymentTypeClassificationOptions.join(",")}"`],
				showErrorMessage: true,
				type: "list",
			};
		}
		worksheet.columns = [{ width: 28 }, { width: 42 }, { width: 20 }];

		const buffer = await workbook.xlsx.writeBuffer();

		downloadBlob(
			new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			}),
			"payment-type-import-template.xlsx",
		);
	} catch {
		downloadBlob(
			new Blob([createPaymentTypeImportTemplateCsv()], {
				type: "text/csv;charset=utf-8",
			}),
			"payment-type-import-template.csv",
		);
	}
}

function createPaymentTypeImportTemplateCsv() {
	return [PaymentTypeImportTemplateHeaders]
		.map((row) =>
			row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
		)
		.join("\n");
}

export async function readPaymentTypeImportFileText(file: File) {
	const fileName = file.name.toLowerCase();

	if (fileName.endsWith(".xlsx")) {
		const rows = await readPaymentTypeImportXlsxRows(await file.arrayBuffer());

		return formatPaymentTypeImportRowsAsText(rows);
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

async function readPaymentTypeImportXlsxRows(buffer: ArrayBuffer) {
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
			cells[columnNumber - 1] = formatPaymentTypeImportExcelCellValue(
				cell.value,
				cell.text,
			);
		});
		rows.push(cells);
	});

	return rows;
}

export function parsePaymentTypeImportText(
	text: string,
	startRowNumber = 1,
): PaymentTypeImportPreviewRow[] {
	const rows = parsePaymentTypeImportTabularRows(text).filter((row) =>
		row.some((cell) => cell.trim() !== ""),
	);

	if (rows.length === 0) return [];

	const headerIndexes = getPaymentTypeImportHeaderIndexes(rows[0]);
	const indexes = headerIndexes ?? PaymentTypeImportDefaultColumnIndexes;
	const dataRows = headerIndexes ? rows.slice(1) : rows;
	const importBatchId = Date.now();

	return dataRows
		.filter((row) => row.some((cell) => cell.trim() !== ""))
		.map((row, index) => {
			const rowNumber = startRowNumber + index;

			return {
				cellErrors: {},
				cellWarnings: {},
				id: `payment-type-import-preview-${rowNumber}-${importBatchId}-${index}`,
				rowErrors: [],
				rowNumber,
				paymentType: {
					description: getImportedPaymentTypeValue(row, indexes.description),
					paymentType: getImportedPaymentTypeValue(row, indexes.paymentType),
					status: "Active",
					sortOrder: rowNumber * 10,
					type: normalizeImportedPaymentTypeClassification(
						getImportedPaymentTypeValue(row, indexes.type),
					),
				},
			};
		});
}

export function validatePaymentTypeImportRows(
	rows: PaymentTypeImportPreviewRow[],
	existingPaymentTypeNames: Map<string, string>,
) {
	const importedNameCounts = new Map<string, number>();

	rows.forEach((row) => {
		const normalizedName = normalizePaymentTypeName(row.paymentType.paymentType);

		if (normalizedName) {
			importedNameCounts.set(
				normalizedName,
				(importedNameCounts.get(normalizedName) ?? 0) + 1,
			);
		}
	});

	return rows.map((row) => {
		const cellErrors: PaymentTypeImportCellErrors = {};
		const cellWarnings: PaymentTypeImportCellWarnings = {};
		const rowErrors: string[] = [];
		const normalizedName = normalizePaymentTypeName(row.paymentType.paymentType);

		if (!row.paymentType.paymentType.trim()) {
			cellErrors.paymentType = ["Name is required."];
		}

		const existingName = existingPaymentTypeNames.get(normalizedName);

		if (existingName) {
			cellErrors.paymentType = [
				...(cellErrors.paymentType ?? []),
				`Payment type already exists: ${existingName}.`,
			];
		}

		if (!PaymentTypeClassificationOptions.includes(row.paymentType.type)) {
			cellErrors.type = ["Category is required."];
		}

		if (row.paymentType.description.trim().length > 500) {
			cellErrors.description = ["Description must be 500 characters or fewer."];
		}

		if (normalizedName && (importedNameCounts.get(normalizedName) ?? 0) > 1) {
			cellErrors.paymentType = [
				...(cellErrors.paymentType ?? []),
				"Duplicate name in import.",
			];
		}

		return { ...row, cellErrors, cellWarnings, rowErrors };
	});
}

export function paymentTypeImportRowHasErrors(
	row: PaymentTypeImportPreviewRow,
) {
	return (
		row.rowErrors.length > 0 ||
		Object.values(row.cellErrors).some((errors) => Boolean(errors?.length))
	);
}

export function validatePaymentTypeImportFileSize(file: File) {
	if (file.size < PaymentTypeImportMinFileSizeBytes) {
		return `Upload a file larger than ${formatFileSize(PaymentTypeImportMinFileSizeBytes)}.`;
	}

	if (file.size > PaymentTypeImportMaxFileSizeBytes) {
		return `Upload a file up to ${formatFileSize(PaymentTypeImportMaxFileSizeBytes)}.`;
	}

	return null;
}

export function isPaymentTypeImportGridPasteTarget(target: EventTarget | null) {
	return !(
		target instanceof HTMLInputElement ||
		target instanceof HTMLSelectElement ||
		target instanceof HTMLTextAreaElement
	);
}

export function getPaymentTypeTableMinWidthClassName(visibleColumnCount: number) {
	if (visibleColumnCount >= 9) return "min-w-[126rem]";
	if (visibleColumnCount === 8) return "min-w-[112rem]";
	if (visibleColumnCount === 7) return "min-w-[98rem]";
	if (visibleColumnCount === 6) return "min-w-[84rem]";
	return "min-w-[64rem]";
}

export function parsePaymentTypeImportTabularRows(text: string) {
	const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

	return normalizedText.includes("\t")
		? normalizedText
				.split("\n")
				.map((line) => line.split("\t").map((cell) => cell.trim()))
		: parsePaymentTypeImportCsvRows(normalizedText);
}

function parsePaymentTypeImportCsvRows(text: string) {
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

function getPaymentTypeImportHeaderIndexes(row: string[]) {
	const indexes: Partial<Record<PaymentTypeImportColumnId, number>> = {};

	row.forEach((cell, index) => {
		const key = normalizePaymentTypeImportHeader(cell);

		if (key) indexes[key] = index;
	});

	return Object.keys(indexes).length >= 2 ? indexes : null;
}

function normalizePaymentTypeImportHeader(
	value: string,
): PaymentTypeImportColumnId | null {
	const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

	if (["name", "paymenttype", "paymenttypename"].includes(normalized)) {
		return "paymentType";
	}
	if (["description", "remarks", "details"].includes(normalized)) {
		return "description";
	}
	if (["category", "classification", "type"].includes(normalized)) {
		return "type";
	}
	return null;
}

function getImportedPaymentTypeValue(row: string[], index?: number) {
	return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

export function normalizeImportedPaymentTypeClassification(
	value: string,
): PaymentTypeClassification {
	const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

	if (normalized === "cash") return "Cash";
	if (normalized === "banktransfer") return "Bank Transfer";
	if (normalized === "check" || normalized === "withbank") return "Check";
	if (normalized === "multiplecheck" || normalized === "multiplechecks") {
		return "Check";
	}
	if (normalized === "digitalwallet" || normalized === "ewallet") {
		return "Digital Wallet";
	}
	if (
		normalized === "noncashsettlement" ||
		normalized === "debit" ||
		normalized === "debitmemo"
	) {
		return "Non-Cash Settlement";
	}

	return value as PaymentTypeClassification;
}

export function normalizeImportedPaymentTypeStatus(
	value: string,
): PaymentTypeStatus {
	const normalized = value.trim().toLowerCase();

	if (!normalized || normalized === "active") return "Active";
	if (normalized === "inactive" || normalized === "in-active") return "Inactive";

	return value as PaymentTypeStatus;
}

export function normalizePaymentTypeName(value: string) {
	return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizePaymentTypeSortOrder(value: string) {
	const sortOrder = Number.parseInt(value, 10);

	return Number.isFinite(sortOrder) && sortOrder >= 0 ? sortOrder : 0;
}

function formatPaymentTypeImportRowsAsText(rows: string[][]) {
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

function formatPaymentTypeImportExcelCellValue(
	value: unknown,
	displayText?: string,
) {
	const normalizedDisplayText = String(displayText ?? "")
		.replace(/\r?\n/g, " ")
		.trim();

	if (normalizedDisplayText) return normalizedDisplayText;
	if (value == null) return "";
	if (value instanceof Date) return value.toISOString().slice(0, 10);

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
			return formatPaymentTypeImportExcelCellValue(record.result);
		}
	}

	return String(value).replace(/\r?\n/g, " ").trim();
}

export function waitForNextPaymentTypeImportBatch() {
	return new Promise<void>((resolve) => {
		window.setTimeout(resolve, 75);
	});
}

