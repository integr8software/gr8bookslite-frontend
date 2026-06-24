import type {
	BankImportColumnId,
	BankMasterfileStatus,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";

export const BankMasterfileHref = "/maintenance/bank-masterfile";

export const BankMasterfileParentLabel = "Accounting master data";

export const BankMasterfileTitle = "Bank Masterfile";

export const BankMasterfileDescription =
	"Maintain company bank accounts and their linked Cash in Bank chart accounts.";

export const BankMasterfileTablePaginationStorageKey =
	"maintenance:financial-management:bank-masterfile";

export const BankMasterfileTableColumns = [
	{ key: "bankName", label: "Bank", className: "w-[16%]" },
	{ key: "branch", label: "Branch", className: "w-[16%]" },
	{ key: "accountNumber", label: "Account Number", className: "w-[16%]" },
	{ key: "accountName", label: "Account Name", className: "w-[26%]" },
	{ key: "accountCode", label: "COA Code", className: "w-[13%]" },
	{ key: "currencyCode", label: "Currency", className: "w-[10%]" },
	{ key: "isDefault", label: "Default", className: "w-[10%]" },
	{ key: "status", label: "Status", className: "w-[11%]" },
	{ key: "createdAt", label: "Date Created", className: "w-[16%]" },
	{ key: "updatedAt", label: "Date Modified", className: "w-[16%]" },
	{ label: "Action", className: "w-[16%] text-center" },
] as const;

export const BankMasterfileStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly BankMasterfileStatus[];

export const BankMasterfileAccountTypeOptions = [
	"Checking",
	"Savings",
	"Current",
] as const;

export const BankMasterfileActionCopy = {
	add: {
		title: "Add Bank",
		description:
			"Create a bank account and link it to Cash in Bank in the Chart of Accounts.",
	},
	edit: {
		title: "Edit Bank",
		description:
			"Update bank details and keep the linked Cash in Bank chart account synchronized.",
	},
	view: {
		title: "View Bank",
		description: "Review the bank account details before making changes.",
	},
} as const;

export const BankImportTemplateHeaders = [
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

export const BankImportFieldOrder: BankImportColumnId[] = [
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

export const BankImportPreviewPageSize = 10;
export const BankImportBatchSize = 25;
export const BankImportMinFileSizeBytes = 1;
export const BankImportMaxFileSizeBytes = 2 * 1024 * 1024;

export const TemplateHeaders = BankImportTemplateHeaders;
export const ImportFieldOrder = BankImportFieldOrder;
export const PreviewPageSize = BankImportPreviewPageSize;
export const ImportBatchSize = BankImportBatchSize;
export const MinImportFileSizeBytes = BankImportMinFileSizeBytes;
export const MaxImportFileSizeBytes = BankImportMaxFileSizeBytes;
