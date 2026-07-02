import {
	BankImportFieldOrder,
	BankImportMaxFileSizeBytes,
	BankImportMinFileSizeBytes,
	BankImportTemplateSampleRow,
	BankImportTemplateHeaders,
	BankMasterfileAccountTypeOptions,
	BankMasterfileStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/bank-masterfile/BankMasterfileConstants";
import { FinancialManagementCashInBankAccountTitle } from "@/app/src/constants/modules/maintenance/financial-management/FinancialManagementAccountTitleConstants";
import { AppMaxFileUploadSizeLabel } from "@/app/src/constants/shared/app/AppConstants";
import type {
	BankImportCellErrors,
	BankImportColumnId,
	BankImportPreviewRow,
	BankMasterfile,
	BankMasterfileFormValues,
	BankMasterfileStatus,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";

export const BankMasterfileInitialFormValues: BankMasterfileFormValues = {
	bankName: "",
	branch: "",
	accountNumber: "",
	accountType: "Checking",
	currencyCode: "PHP",
	currencyExchangeRate: "",
	isDefault: false,
	seriesStart: "",
	seriesEnd: "",
	seriesDigits: "",
	status: "Active",
};

export function createBankMasterfileFormValues(
	bank: BankMasterfile,
): BankMasterfileFormValues {
	return {
		bankName: bank.bankName,
		branch: bank.branch,
		accountNumber: bank.accountNumber,
		accountType: bank.accountType || "Checking",
		currencyCode: bank.currencyCode || "PHP",
		currencyExchangeRate: bank.currencyExchangeRate,
		isDefault: bank.isDefault,
		seriesStart: bank.seriesStart,
		seriesEnd: bank.seriesEnd,
		seriesDigits: bank.seriesDigits,
		status: bank.status,
	};
}

export function updateBankMasterfileFromForm(
	bank: BankMasterfile,
	values: BankMasterfileFormValues,
): BankMasterfile {
	return {
		...bank,
		...values,
		bankName: values.bankName.trim(),
		branch: values.branch.trim(),
		accountNumber: values.accountNumber.trim(),
		accountType: values.accountType.trim(),
		currencyCode: values.currencyCode.trim(),
		currencyExchangeRate: values.currencyExchangeRate.trim(),
		seriesStart: values.seriesStart.trim(),
		seriesEnd: values.seriesEnd.trim(),
		seriesDigits: values.seriesDigits.trim(),
		accountName: buildBankMasterfileAccountName(values),
	};
}

export function buildBankMasterfileAccountName(
	values: Pick<
		BankMasterfileFormValues,
		"bankName" | "branch" | "accountNumber"
	>,
) {
	return [
		FinancialManagementCashInBankAccountTitle,
		values.bankName.trim(),
		values.branch.trim(),
		values.accountNumber.trim(),
	]
		.filter(Boolean)
		.join(" - ");
}

export function createBlankRow(rowNumber: number): BankImportPreviewRow {
	return {
		id: `bank-import-${Date.now()}-${rowNumber}`,
		rowNumber,
		cellErrors: {},
		rowErrors: [],
		values: {
			bankName: "",
			branch: "",
			accountNumber: "",
			accountType: "Checking",
			currencyCode: "PHP",
			currencyExchangeRate: "",
			seriesStart: "",
			seriesEnd: "",
			seriesDigits: "",
			isDefault: false,
			status: "Active",
		},
	};
}

export function parseBankImportRows(
	rows: string[][],
	startRowNumber = 1,
): BankImportPreviewRow[] {
	const meaningfulRows = rows.filter((row) => row.some((cell) => cell.trim()));
	if (meaningfulRows.length === 0) return [];

	const headerIndexes = getHeaderIndexes(meaningfulRows[0]);
	const hasHeader = Object.keys(headerIndexes).length >= 2;
	const dataRows = hasHeader ? meaningfulRows.slice(1) : meaningfulRows;

	return dataRows.map((cells, index) => {
		const rowNumber = startRowNumber + index;
		const row = createBlankRow(rowNumber);
		const values = { ...row.values };

		BankImportFieldOrder.forEach((field, fieldIndex) => {
			const sourceIndex = headerIndexes[field] ?? fieldIndex;
			const rawValue = cells[sourceIndex]?.trim() ?? "";
			(values as Record<string, string | boolean>)[field] = normalizeCellValue(
				field,
				rawValue,
			);
		});

		return {
			...row,
			id: `bank-import-${Date.now()}-${rowNumber}-${index}`,
			values,
		};
	});
}

export function validateBankImportRows(
	rows: BankImportPreviewRow[],
	existingBanks: BankMasterfile[],
) {
	const existingKeys = new Set(existingBanks.map(getBankKey));
	const importCounts = new Map<string, number>();

	rows.forEach((row) => {
		const key = getBankKey(row.values);
		importCounts.set(key, (importCounts.get(key) ?? 0) + 1);
	});

	return rows.map((row) => {
		const cellErrors: BankImportCellErrors = {};
		const rowErrors: string[] = [];
		const values = row.values;
		const key = getBankKey(values);

		addRequiredError(
			cellErrors,
			"bankName",
			values.bankName,
			"Bank is required.",
		);
		addRequiredError(
			cellErrors,
			"currencyCode",
			values.currencyCode,
			"Currency is required.",
		);
		addRequiredError(
			cellErrors,
			"seriesStart",
			values.seriesStart,
			"Series start is required.",
		);
		addRequiredError(
			cellErrors,
			"seriesEnd",
			values.seriesEnd,
			"Series end is required.",
		);
		addRequiredError(
			cellErrors,
			"seriesDigits",
			values.seriesDigits,
			"Series digits are required.",
		);
		if (values.status === "Active" && !values.accountNumber.trim()) {
			cellErrors.accountNumber = [
				"Account number is required before activating.",
			];
		}

		if (
			!BankMasterfileAccountTypeOptions.includes(values.accountType as never)
		) {
			cellErrors.accountType = ["Select a valid account type."];
		}
		if (!BankMasterfileStatusOptions.includes(values.status)) {
			cellErrors.status = ["Select a valid status."];
		}
		if (
			values.currencyExchangeRate &&
			!isPositiveNumber(values.currencyExchangeRate)
		) {
			cellErrors.currencyExchangeRate = [
				"Exchange rate must be a positive number.",
			];
		}
		if (values.seriesDigits && !isPositiveInteger(values.seriesDigits)) {
			cellErrors.seriesDigits = [
				"Series digits must be a positive whole number.",
			];
		}
		if (values.seriesStart && !/^\d+$/.test(values.seriesStart)) {
			cellErrors.seriesStart = ["Series start must contain digits only."];
		}
		if (values.seriesEnd && !/^\d+$/.test(values.seriesEnd)) {
			cellErrors.seriesEnd = ["Series end must contain digits only."];
		}
		if (
			/^\d+$/.test(values.seriesStart) &&
			/^\d+$/.test(values.seriesEnd) &&
			Number(values.seriesStart) > Number(values.seriesEnd)
		) {
			cellErrors.seriesEnd = [
				"Series end must be greater than or equal to series start.",
			];
		}
		if (existingKeys.has(key))
			rowErrors.push("This bank account already exists.");
		if ((importCounts.get(key) ?? 0) > 1)
			rowErrors.push("Duplicate bank account in import.");

		return { ...row, cellErrors, rowErrors };
	});
}

function addRequiredError(
	errors: BankImportCellErrors,
	field: BankImportColumnId,
	value: string,
	message: string,
) {
	if (!value.trim()) errors[field] = [message];
}

export function rowHasErrors(row: BankImportPreviewRow) {
	return row.rowErrors.length > 0 || Object.keys(row.cellErrors).length > 0;
}

export function normalizeCellValue(
	field: BankImportColumnId,
	value: string | boolean,
): never {
	if (field === "isDefault") {
		return parseBoolean(value) as never;
	}
	if (field === "status") {
		return parseStatus(String(value)) as never;
	}
	if (field === "accountType") {
		const normalized = String(value).trim().toLowerCase();
		return (BankMasterfileAccountTypeOptions.find(
			(option) => option.toLowerCase() === normalized,
		) ?? String(value).trim()) as never;
	}
	if (field === "currencyCode")
		return String(value).trim().toUpperCase() as never;
	return String(value) as never;
}

export function cleanBankValues(values: BankMasterfileFormValues) {
	return {
		...values,
		bankName: values.bankName.trim(),
		branch: values.branch.trim(),
		accountNumber: values.accountNumber.trim(),
		currencyCode: values.currencyCode.trim().toUpperCase(),
		currencyExchangeRate: values.currencyExchangeRate.trim(),
		seriesStart: values.seriesStart.trim(),
		seriesEnd: values.seriesEnd.trim(),
		seriesDigits: values.seriesDigits.trim(),
	};
}

export function renumberRows(rows: BankImportPreviewRow[]) {
	return rows.map((row, index) => ({ ...row, rowNumber: index + 1 }));
}

export function getNextRowNumber(rows: BankImportPreviewRow[]) {
	return rows.length + 1;
}

export function getPreviewRowContentKey(row: BankImportPreviewRow) {
	return BankImportFieldOrder.map((field) =>
		String(row.values[field]).trim().toLowerCase(),
	).join("|");
}

function getBankKey(
	bank: Pick<BankMasterfileFormValues, "bankName" | "branch" | "accountNumber">,
) {
	return [bank.bankName, bank.branch, bank.accountNumber]
		.map((value) => value.trim().toLowerCase())
		.join("|");
}

function getHeaderIndexes(row: string[]) {
	const indexes: Partial<Record<BankImportColumnId, number>> = {};

	row.forEach((cell, index) => {
		const field = normalizeHeader(cell);
		if (field) indexes[field] = index;
	});

	return indexes;
}

function normalizeHeader(value: string): BankImportColumnId | null {
	const header = value.toLowerCase().replace(/[^a-z0-9]/g, "");
	const headers: Record<string, BankImportColumnId> = {
		bank: "bankName",
		bankname: "bankName",
		branch: "branch",
		accountnumber: "accountNumber",
		accountno: "accountNumber",
		accounttype: "accountType",
		currency: "currencyCode",
		currencycode: "currencyCode",
		exchangerate: "currencyExchangeRate",
		currencyexchangerate: "currencyExchangeRate",
		seriesstart: "seriesStart",
		seriesend: "seriesEnd",
		seriesdigits: "seriesDigits",
		default: "isDefault",
		isdefault: "isDefault",
		status: "status",
	};

	return headers[header] ?? null;
}

export async function readBankImportFile(file: File) {
	const fileName = file.name.toLowerCase();

	if (fileName.endsWith(".xlsx")) {
		const ExcelJS = await import("exceljs");
		const workbook = new ExcelJS.default.Workbook();
		await workbook.xlsx.load(await file.arrayBuffer());
		const worksheet = workbook.worksheets[0];
		if (!worksheet)
			throw new Error("No worksheet was found in the Excel file.");

		const rows: string[][] = [];
		worksheet.eachRow((row) => {
			const cells: string[] = [];
			row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
				cells[columnNumber - 1] = formatExcelValue(cell.value, cell.text);
			});
			rows.push(cells);
		});
		return rows;
	}

	if (
		[".csv", ".tsv", ".txt"].some((extension) => fileName.endsWith(extension))
	) {
		return parseTabularText(await file.text());
	}

	throw new Error("Please upload an .xlsx, .csv, .tsv, or .txt file.");
}

export function parseTabularText(text: string) {
	const normalized = text.replace(/^\uFEFF/, "").trim();
	if (!normalized) return [];
	return normalized.includes("\t")
		? normalized.split(/\r?\n/).map((line) => line.split("\t"))
		: parseCsvRows(normalized);
}

function parseCsvRows(text: string) {
	const rows: string[][] = [];
	let row: string[] = [];
	let cell = "";
	let quoted = false;

	for (let index = 0; index < text.length; index += 1) {
		const character = text[index];
		if (character === '"') {
			if (quoted && text[index + 1] === '"') {
				cell += '"';
				index += 1;
			} else {
				quoted = !quoted;
			}
		} else if (character === "," && !quoted) {
			row.push(cell);
			cell = "";
		} else if ((character === "\n" || character === "\r") && !quoted) {
			if (character === "\r" && text[index + 1] === "\n") index += 1;
			row.push(cell);
			rows.push(row);
			row = [];
			cell = "";
		} else {
			cell += character;
		}
	}
	row.push(cell);
	rows.push(row);
	return rows;
}

export async function downloadBankImportTemplate() {
	try {
		const ExcelJS = await import("exceljs");
		const workbook = new ExcelJS.default.Workbook();
		const worksheet = workbook.addWorksheet("Bank Accounts");
		worksheet.addRow([...BankImportTemplateHeaders]);
		worksheet.addRow([...BankImportTemplateSampleRow]);
		worksheet.getRow(1).font = { bold: true };
		worksheet.columns.forEach((column) => {
			column.width = 18;
		});
		for (let row = 2; row <= 250; row += 1) {
			worksheet.getCell(`D${row}`).dataValidation = {
				type: "list",
				allowBlank: false,
				formulae: [`"${BankMasterfileAccountTypeOptions.join(",")}"`],
			};
			worksheet.getCell(`J${row}`).dataValidation = {
				type: "list",
				allowBlank: false,
				formulae: ['"No,Yes"'],
			};
			worksheet.getCell(`K${row}`).dataValidation = {
				type: "list",
				allowBlank: false,
				formulae: [`"${BankMasterfileStatusOptions.join(",")}"`],
			};
		}
		const buffer = await workbook.xlsx.writeBuffer();
		downloadBlob(
			new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			}),
			"bank-masterfile-import-template.xlsx",
		);
	} catch {
		downloadBlob(
			new Blob(
				[
					`${BankImportTemplateHeaders.join(",")}\nBDO,Makati,1234567890,Checking,PHP,,,,,No,Active\n`,
					`${BankImportTemplateHeaders.join(",")}\n${BankImportTemplateSampleRow.join(",")}\n`,
				],
				{ type: "text/csv;charset=utf-8" },
			),
			"bank-masterfile-import-template.csv",
		);
	}
}

function formatExcelValue(value: unknown, displayText?: string) {
	if (displayText?.trim()) return displayText.trim();
	if (value === null || value === undefined) return "";
	if (typeof value === "object" && "result" in value) {
		return formatExcelValue((value as { result?: unknown }).result);
	}
	return String(value);
}

function parseBoolean(value: string | boolean) {
	if (typeof value === "boolean") return value;
	return ["yes", "true", "1", "default"].includes(value.trim().toLowerCase());
}

function parseStatus(value: string): BankMasterfileStatus {
	return value.trim().toLowerCase() === "inactive" ? "Inactive" : "Active";
}

function isPositiveNumber(value: string) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0;
}

function isPositiveInteger(value: string) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0;
}

export function validateImportFileSize(file: File) {
	if (file.size < BankImportMinFileSizeBytes) return "The selected file is empty.";
	if (file.size > BankImportMaxFileSizeBytes) {
		return `Upload a file up to ${AppMaxFileUploadSizeLabel}.`;
	}
	return null;
}

export function waitForNextBatch() {
	return new Promise<void>((resolve) => window.setTimeout(resolve, 0));
}
