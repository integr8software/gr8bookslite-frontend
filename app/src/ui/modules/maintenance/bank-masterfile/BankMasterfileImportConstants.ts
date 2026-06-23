import type { BankImportColumnId } from "@/app/src/ui/modules/maintenance/bank-masterfile/BankMasterfileImportTypes";

export const TemplateHeaders = [
	"Bank",
	"Branch",
	"Account Number",
	"Account Type",
	"Currency",
	"Exchange Rate",
	"Series Start",
	"Series End",
	"Series Digits",
	"Default",
	"Status",
] as const;

export const ImportFieldOrder: BankImportColumnId[] = [
	"bankName",
	"branch",
	"accountNumber",
	"accountType",
	"currencyCode",
	"currencyExchangeRate",
	"seriesStart",
	"seriesEnd",
	"seriesDigits",
	"isDefault",
	"status",
];

export const PreviewPageSize = 10;
export const ImportBatchSize = 25;
export const MinImportFileSizeBytes = 1;
export const MaxImportFileSizeBytes = 2 * 1024 * 1024;
