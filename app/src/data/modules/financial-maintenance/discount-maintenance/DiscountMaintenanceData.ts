import {
	DiscountImportDefaultColumnIndexes,
	DiscountImportMaxFileSizeBytes,
	DiscountImportMinFileSizeBytes,
	DiscountImportTemplateHeaders,
	DiscountMaintenanceTypeOptions,
	DiscountMaintenanceValueTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceConstants";
import type {
	Discount,
	DiscountImportCellErrors,
	DiscountImportCellWarnings,
	DiscountImportColumnId,
	DiscountImportPreviewRow,
	DiscountMaintenanceFormValues,
	DiscountMaintenanceTableRecord,
	DiscountTransactionType,
	DiscountType,
} from "@/app/src/types/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceTypes";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { formatFileSize } from "@/app/src/utils/file.util";
import { isModuleImportOptionValue } from "@/app/src/utils/module-import.util";

export const DiscountMaintenanceInitialFormValues: DiscountMaintenanceFormValues =
	{
		name: "",
		description: "",
		type: "Sales",
		discountType: "Percentage",
		amount: "",
		status: "Active",
	};

export function createDiscountMaintenanceFormValues(
	discount: Discount,
): DiscountMaintenanceFormValues {
	const legacyDiscount = discount as Discount & {
		moduleNames?: string[];
		percentage?: number;
	};

	return {
		name: discount.name ?? discount.description,
		description: discount.description,
		type: discount.type ?? inferLegacyDiscountType(legacyDiscount),
		discountType: discount.discountType ?? "Percentage",
		amount: String(discount.amount ?? legacyDiscount.percentage ?? ""),
		status: discount.status ?? "Active",
	};
}

export function createDiscountFromForm(
	values: DiscountMaintenanceFormValues,
): Discount {
	return createDiscountRecord({
		id: `d_${Date.now().toString(36)}`,
		name: values.name.trim(),
		description: values.description.trim(),
		type: values.type,
		discountType: values.discountType,
		amount: Number(values.amount),
		status: values.status,
	});
}

export function updateDiscountFromForm(
	discount: Discount,
	values: DiscountMaintenanceFormValues,
): Discount {
	return createDiscountRecord({
		...discount,
		name: values.name.trim(),
		description: values.description.trim(),
		type: values.type,
		discountType: values.discountType,
		amount: Number(values.amount),
		status: values.status,
	});
}

export function createDiscountRecord(discount: Discount): Discount {
	const name = discount.name.trim();
	const accountTitle =
		discount.accountTitle ?? getDiscountAccountTitle(discount.type, name);

	return {
		...discount,
		name,
		accountId: getDiscountAccountCode(discount.type, name),
		accountCode: getDiscountAccountCode(discount.type, name),
		accountTitle,
		accountGroupPath: getDiscountAccountGroupPath(discount.type),
	};
}

export function getDiscountAccountTitle(
	type: DiscountTransactionType,
	name: string,
) {
	return `${type === "Purchase" ? "Purchase Discount" : "Sales Discount"} - ${name.trim()}`;
}

export function getDiscountAccountGroupPath(type: DiscountTransactionType) {
	return type === "Purchase"
		? "Cost of Sales > Purchase Discount"
		: "Sales > Sales Discount";
}

export function getDiscountAccountCode(
	type: DiscountTransactionType,
	name: string,
) {
	const slug = name
		.trim()
		.toUpperCase()
		.replace(/[^A-Z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 16);

	return `${type === "Purchase" ? "PD" : "SD"}-${slug || "DISCOUNT"}`;
}

export function createDiscountStatistics(discounts: Discount[]) {
	return {
		totalDiscounts: discounts.length,
		activeDiscounts: discounts.filter((discount) => discount.status === "Active")
			.length,
		inactiveDiscounts: discounts.filter(
			(discount) => discount.status === "Inactive",
		).length,
		purchaseDiscounts: discounts.filter(
			(discount) => discount.type === "Purchase",
		).length,
		salesDiscounts: discounts.filter((discount) => discount.type === "Sales")
			.length,
		percentageDiscounts: discounts.filter(
			(discount) => discount.discountType === "Percentage",
		).length,
	};
}

export function createDiscountMaintenanceTableRecord(
	discount: Discount,
): DiscountMaintenanceTableRecord {
	return {
		...discount,
		amountLabel:
			discount.discountType === "Percentage"
				? `${discount.amount}%`
				: formatFixedDiscount(discount.amount),
		valueLabel: discount.discountType,
	};
}

export function getDiscountMaintenanceTableMinWidthClassName(
	visibleColumnCount: number,
) {
	if (visibleColumnCount >= 9) return "min-w-[126rem]";
	if (visibleColumnCount === 8) return "min-w-[112rem]";
	if (visibleColumnCount === 7) return "min-w-[98rem]";
	if (visibleColumnCount === 6) return "min-w-[84rem]";
	return "min-w-[70rem]";
}

export function createExistingDiscountNameMap(discounts: Discount[]) {
	return new Map(
		discounts.map((discount) => [
			normalizeDiscountName(discount.name),
			discount.name,
		]),
	);
}

export function createBlankDiscountImportRow(
	rowNumber: number,
): DiscountImportPreviewRow {
	return {
		cellErrors: {},
		cellWarnings: {},
		discount: createDiscountRecord({
			id: `discount-import-preview-${rowNumber}-${Date.now()}`,
			name: "",
			description: "",
			type: "Sales",
			discountType: "Percentage",
			amount: 0,
			status: "Active",
		}),
		id: `discount-import-preview-${rowNumber}-${Date.now()}`,
		rowErrors: [],
		rowNumber,
	};
}

export function renumberDiscountImportRows(rows: DiscountImportPreviewRow[]) {
	return rows.map((row, index) => ({
		...row,
		rowNumber: index + 1,
	}));
}

export function removeDuplicateDiscountImportRows(
	rows: DiscountImportPreviewRow[],
	baseRows: DiscountImportPreviewRow[],
) {
	const seenNames = new Set(
		baseRows
			.map((row) => normalizeDiscountName(row.discount.name))
			.filter(Boolean),
	);
	const uniqueRows: DiscountImportPreviewRow[] = [];
	let skippedCount = 0;

	rows.forEach((row) => {
		const normalizedName = normalizeDiscountName(row.discount.name);

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

export function getNextDiscountImportRowNumber(
	rows: DiscountImportPreviewRow[],
) {
	return Math.max(0, ...rows.map((row) => row.rowNumber)) + 1;
}

export function normalizeImportedDiscountCellValue(
	field: DiscountImportColumnId,
	value: string,
) {
	if (field === "type") return normalizeImportedDiscountType(value);
	if (field === "discountType") return normalizeImportedDiscountValueType(value);
	return value;
}

export async function downloadDiscountImportTemplate() {
	try {
		const ExcelJS = await import("exceljs");
		const workbook = new ExcelJS.default.Workbook();
		const worksheet = workbook.addWorksheet("Discounts");

		worksheet.addRow(DiscountImportTemplateHeaders);
		for (let rowNumber = 2; rowNumber <= 101; rowNumber += 1) {
			worksheet.getCell(`B${rowNumber}`).dataValidation = {
				allowBlank: false,
				formulae: [`"${DiscountMaintenanceTypeOptions.join(",")}"`],
				showErrorMessage: true,
				type: "list",
			};
			worksheet.getCell(`D${rowNumber}`).dataValidation = {
				allowBlank: false,
				formulae: [`"${DiscountMaintenanceValueTypeOptions.join(",")}"`],
				showErrorMessage: true,
				type: "list",
			};
		}
		worksheet.columns = [
			{ width: 28 },
			{ width: 14 },
			{ width: 36 },
			{ width: 18 },
			{ width: 16 },
		];

		const buffer = await workbook.xlsx.writeBuffer();

		downloadBlob(
			new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			}),
			"discount-maintenance-import-template.xlsx",
		);
	} catch {
		downloadBlob(
			new Blob([createDiscountImportTemplateCsv()], {
				type: "text/csv;charset=utf-8",
			}),
			"discount-maintenance-import-template.csv",
		);
	}
}

function createDiscountImportTemplateCsv() {
	return [DiscountImportTemplateHeaders]
		.map((row) =>
			row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
		)
		.join("\n");
}

export async function readDiscountImportFileText(file: File) {
	const fileName = file.name.toLowerCase();

	if (fileName.endsWith(".xlsx")) {
		const rows = await readDiscountImportXlsxRows(await file.arrayBuffer());

		return formatDiscountImportRowsAsText(rows);
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

async function readDiscountImportXlsxRows(buffer: ArrayBuffer) {
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
			cells[columnNumber - 1] = formatDiscountImportExcelCellValue(
				cell.value,
				cell.text,
			);
		});
		rows.push(cells);
	});

	return rows;
}

export function parseDiscountImportText(
	text: string,
	startRowNumber = 1,
): DiscountImportPreviewRow[] {
	const rows = parseDiscountImportTabularRows(text).filter((row) =>
		row.some((cell) => cell.trim() !== ""),
	);

	if (rows.length === 0) {
		return [];
	}

	const headerIndexes = getDiscountImportHeaderIndexes(rows[0]);
	const indexes = headerIndexes ?? DiscountImportDefaultColumnIndexes;
	const dataRows = headerIndexes ? rows.slice(1) : rows;
	const importBatchId = Date.now();

	return dataRows
		.filter((row) => row.some((cell) => cell.trim() !== ""))
		.map((row, index) => {
			const rowNumber = startRowNumber + index;
			const discount = createDiscountRecord({
				id: `discount-import-preview-${rowNumber}-${importBatchId}-${index}`,
				name: getImportedDiscountValue(row, indexes.name),
				type: normalizeImportedDiscountType(
					getImportedDiscountValue(row, indexes.type),
				),
				description: getImportedDiscountValue(row, indexes.description),
				discountType: normalizeImportedDiscountValueType(
					getImportedDiscountValue(row, indexes.discountType),
				),
				amount: Number(getImportedDiscountValue(row, indexes.amount) || 0),
				status: "Active",
			});

			return {
				cellErrors: {},
				cellWarnings: {},
				discount,
				id: `discount-import-preview-${rowNumber}-${importBatchId}-${index}`,
				rowErrors: [],
				rowNumber,
			};
		});
}

export function validateDiscountImportRows(
	rows: DiscountImportPreviewRow[],
	existingDiscountNames: Map<string, string>,
) {
	const importedNameCounts = new Map<string, number>();

	rows.forEach((row) => {
		const normalizedName = normalizeDiscountName(row.discount.name);

		if (normalizedName) {
			importedNameCounts.set(
				normalizedName,
				(importedNameCounts.get(normalizedName) ?? 0) + 1,
			);
		}
	});

	return rows.map((row) => {
		const cellErrors: DiscountImportCellErrors = {};
		const cellWarnings: DiscountImportCellWarnings = {};
		const rowErrors: string[] = [];
		const normalizedName = normalizeDiscountName(row.discount.name);

		if (!row.discount.name.trim()) {
			cellErrors.name = ["Name is required."];
		}

		const existingDiscountName = existingDiscountNames.get(normalizedName);

		if (existingDiscountName) {
			cellErrors.name = [
				...(cellErrors.name ?? []),
				`Discount already exists: ${existingDiscountName}.`,
			];
		}

		if (!row.discount.type.trim()) {
			cellErrors.type = ["Type is required. Choose a value from the list."];
		} else if (!isModuleImportOptionValue(row.discount.type, DiscountMaintenanceTypeOptions)) {
			cellErrors.type = ["Choose Purchase or Sales from the list."];
		}

		if (!row.discount.description.trim()) {
			cellErrors.description = ["Description is required."];
		} else if (row.discount.description.trim().length > 500) {
			cellErrors.description = ["Description must be 500 characters or fewer."];
		}

		if (!row.discount.discountType.trim()) {
			cellErrors.discountType = ["Discount type is required. Choose a value from the list."];
		} else if (!isModuleImportOptionValue(row.discount.discountType, DiscountMaintenanceValueTypeOptions)) {
			cellErrors.discountType = ["Choose Percentage or Fixed from the list."];
		}

		if (!Number.isFinite(row.discount.amount) || row.discount.amount < 0) {
			cellErrors.amount = ["Discount Value must be 0 or greater."];
		} else if (
			row.discount.discountType === "Percentage" &&
			row.discount.amount > 100
		) {
			cellErrors.amount = ["Percentage discounts must be 0 to 100."];
		}

		if (normalizedName && (importedNameCounts.get(normalizedName) ?? 0) > 1) {
			cellErrors.name = [
				...(cellErrors.name ?? []),
				"Duplicate name in import.",
			];
		}

		return {
			...row,
			cellErrors,
			cellWarnings,
			discount: createDiscountRecord(row.discount),
			rowErrors,
		};
	});
}

export function rowHasErrors(row: DiscountImportPreviewRow) {
	return (
		row.rowErrors.length > 0 ||
		Object.values(row.cellErrors).some((errors) => Boolean(errors?.length))
	);
}

export function validateImportFileSize(file: File) {
	if (file.size < DiscountImportMinFileSizeBytes) {
		return `Upload a file larger than ${formatFileSize(DiscountImportMinFileSizeBytes)}.`;
	}

	if (file.size > DiscountImportMaxFileSizeBytes) {
		return `Upload a file up to ${formatFileSize(DiscountImportMaxFileSizeBytes)}.`;
	}

	return null;
}

export function isDiscountImportGridPasteTarget(target: EventTarget | null) {
	return !(
		target instanceof HTMLInputElement ||
		target instanceof HTMLSelectElement ||
		target instanceof HTMLTextAreaElement
	);
}

export function parseDiscountImportTabularRows(text: string) {
	const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

	return normalizedText.includes("\t")
		? normalizedText
				.split("\n")
				.map((line) => line.split("\t").map((cell) => cell.trim()))
		: parseDiscountImportCsvRows(normalizedText);
}

export function normalizeImportedDiscountType(
	value: string,
): DiscountTransactionType {
	const normalized = value.trim().toLowerCase();

	if (normalized === "purchase" || normalized === "purchases") return "Purchase";
	if (normalized === "sale" || normalized === "sales") return "Sales";
	return value as DiscountTransactionType;
}

export function normalizeImportedDiscountValueType(value: string): DiscountType {
	const normalized = value.trim().toLowerCase();

	if (["percentage", "percent", "%"].includes(normalized)) return "Percentage";
	if (["fixed", "amount", "flat"].includes(normalized)) return "Fixed";
	return value as DiscountType;
}

export function normalizeDiscountName(value: string) {
	return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function waitForNextImportBatch() {
	return new Promise<void>((resolve) => {
		window.setTimeout(resolve, 75);
	});
}

function inferLegacyDiscountType(
	discount: Discount & { moduleNames?: string[] },
): DiscountTransactionType {
	return discount.moduleNames?.some((name) =>
		name.toLowerCase().includes("purchase"),
	)
		? "Purchase"
		: "Sales";
}

function formatFixedDiscount(amount: number) {
	return amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

function parseDiscountImportCsvRows(text: string) {
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

function getDiscountImportHeaderIndexes(row: string[]) {
	const indexes: Partial<Record<DiscountImportColumnId, number>> = {};

	row.forEach((cell, index) => {
		const key = normalizeDiscountImportHeader(cell);

		if (key) indexes[key] = index;
	});

	return Object.keys(indexes).length >= 3 ? indexes : null;
}

function normalizeDiscountImportHeader(
	value: string,
): DiscountImportColumnId | null {
	const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");

	if (["name", "discount", "discountname"].includes(normalized)) return "name";
	if (["type", "transactiontype"].includes(normalized)) return "type";
	if (["description", "desc"].includes(normalized)) return "description";
	if (["discounttype", "valuetype", "valuekind"].includes(normalized)) {
		return "discountType";
	}
	if (["discountvalue", "value", "amount"].includes(normalized)) {
		return "amount";
	}

	return null;
}

function getImportedDiscountValue(row: string[], index?: number) {
	return typeof index === "number" ? String(row[index] ?? "").trim() : "";
}

function formatDiscountImportRowsAsText(rows: string[][]) {
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

function formatDiscountImportExcelCellValue(
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

		if ("result" in record) return formatDiscountImportExcelCellValue(record.result);
	}

	return String(value).replace(/\r?\n/g, " ").trim();
}

