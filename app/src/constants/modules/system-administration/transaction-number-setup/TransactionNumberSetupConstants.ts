import type {
	TransactionNumberInputMode,
	TransactionNumberModuleCode,
	TransactionNumberScope,
	TransactionNumberSetupTableColumnKey,
	TransactionNumberStatus,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

export const TransactionNumberSetupHref =
	"/system-administration/transaction-number-setup";

export const TransactionNumberSetupPaginationStorageKey =
	"system-administration.transaction-number-setup";

export const TransactionNumberSetupEditFromParam = "from";
export const TransactionNumberSetupEditFromViewValue = "view";
export const TransactionNumberSetupEditFromViewQuery = `${TransactionNumberSetupEditFromParam}=${TransactionNumberSetupEditFromViewValue}`;

export const TransactionNumberModuleCodes = [
	"party-management",
	"item-management",
	"official-receipt",
	"collection-receipt",
	"acknowledgement-receipt",
	"provisional-receipt",
	"bank-reconciliation",
	"product-distribution-center-warehouse",
	"disbursement-voucher",
	"cash-advance",
	"cash-advance-multiple-entry",
	"petty-cash-voucher",
	"petty-cash-fund",
	"petty-cash-fund-replenishment",
	"petty-cash-advance",
	"petty-cash-advance-replenishment",
	"request-for-payment",
	"advances-to-supplier",
	"account-payable-voucher",
	"journal-voucher",
	"debit-memo",
	"credit-memo",
	"sales-quotation",
	"sales-order",
	"sales-invoice",
	"billing",
	"billing-statement",
	"billing-invoice",
	"service-invoice",
	"cash-sales-invoice",
	"sales-journal",
	"statement-of-account",
	"material-request",
	"receiving-report",
	"goods-receipt",
	"goods-issue",
	"delivery-receipt",
	"pick-list",
	"purchasing-request",
	"canvass-form",
	"purchase-order",
	"purchase-journal",
	"fixed-assets",
] as const satisfies readonly TransactionNumberModuleCode[];

export const TransactionNumberModuleOptions = [
	{
		code: "party-management",
		name: "Party Management",
		defaultPrefix: "PTY",
	},
	{
		code: "item-management",
		name: "Item Management",
		defaultPrefix: "ITEM",
	},
	{
		code: "official-receipt",
		name: "Official Receipt",
		defaultPrefix: "OR",
	},
	{
		code: "collection-receipt",
		name: "Collection Receipt",
		defaultPrefix: "CR",
	},
	{
		code: "acknowledgement-receipt",
		name: "Acknowledgement Receipt",
		defaultPrefix: "AR",
	},
	{
		code: "provisional-receipt",
		name: "Provisional Receipt",
		defaultPrefix: "PR",
	},
	{
		code: "bank-reconciliation",
		name: "Bank Reconciliation",
		defaultPrefix: "BR",
	},
	{
		code: "product-distribution-center-warehouse",
		name: "Product Distribution Center Warehouse",
		defaultPrefix: "PDC",
	},
	{
		code: "disbursement-voucher",
		name: "Disbursement Voucher",
		defaultPrefix: "DV",
	},
	{
		code: "cash-advance",
		name: "Cash Advance",
		defaultPrefix: "CA",
	},
	{
		code: "cash-advance-multiple-entry",
		name: "Cash Advance Multiple Entry",
		defaultPrefix: "CAME",
	},
	{
		code: "petty-cash-voucher",
		name: "Petty Cash Voucher",
		defaultPrefix: "PCV",
	},
	{
		code: "petty-cash-fund",
		name: "Petty Cash Fund",
		defaultPrefix: "PCF",
	},
	{
		code: "petty-cash-fund-replenishment",
		name: "Petty Cash Fund Replenishment",
		defaultPrefix: "PCFR",
	},
	{
		code: "petty-cash-advance",
		name: "Petty Cash Advance",
		defaultPrefix: "PCA",
	},
	{
		code: "petty-cash-advance-replenishment",
		name: "Petty Cash Advance Replenishment",
		defaultPrefix: "PCAR",
	},
	{
		code: "request-for-payment",
		name: "Request For Payment",
		defaultPrefix: "RP",
	},
	{
		code: "advances-to-supplier",
		name: "Advances To Supplier",
		defaultPrefix: "ADV",
	},
	{
		code: "account-payable-voucher",
		name: "Account Payable Voucher",
		defaultPrefix: "APV",
	},
	{
		code: "journal-voucher",
		name: "Journal Voucher",
		defaultPrefix: "JV",
	},
	{
		code: "debit-memo",
		name: "Debit Memo",
		defaultPrefix: "DM",
	},
	{
		code: "credit-memo",
		name: "Credit Memo",
		defaultPrefix: "CM",
	},
	{
		code: "sales-quotation",
		name: "Sales Quotation",
		defaultPrefix: "SQ",
	},
	{
		code: "sales-order",
		name: "Sales Order",
		defaultPrefix: "SO",
	},
	{
		code: "sales-invoice",
		name: "Sales Invoice",
		defaultPrefix: "SI",
	},
	{
		code: "billing",
		name: "Billing",
		defaultPrefix: "BILL",
	},
	{
		code: "billing-statement",
		name: "Billing Statement",
		defaultPrefix: "BS",
	},
	{
		code: "billing-invoice",
		name: "Billing Invoice",
		defaultPrefix: "BI",
	},
	{
		code: "service-invoice",
		name: "Service Invoice",
		defaultPrefix: "SRVI",
	},
	{
		code: "cash-sales-invoice",
		name: "Cash Sales Invoice",
		defaultPrefix: "CSI",
	},
	{
		code: "sales-journal",
		name: "Sales Journal",
		defaultPrefix: "SJ",
	},
	{
		code: "statement-of-account",
		name: "Statement of Account",
		defaultPrefix: "SOA",
	},
	{
		code: "material-request",
		name: "Material Request",
		defaultPrefix: "MR",
	},
	{
		code: "receiving-report",
		name: "Receiving Report",
		defaultPrefix: "RR",
	},
	{
		code: "goods-receipt",
		name: "Goods Receipt",
		defaultPrefix: "GR",
	},
	{
		code: "goods-issue",
		name: "Goods Issue",
		defaultPrefix: "GI",
	},
	{
		code: "delivery-receipt",
		name: "Delivery Receipt",
		defaultPrefix: "DR",
	},
	{
		code: "pick-list",
		name: "Pick List",
		defaultPrefix: "PL",
	},
	{
		code: "purchasing-request",
		name: "Purchasing Request",
		defaultPrefix: "PR",
	},
	{
		code: "canvass-form",
		name: "Canvass Form",
		defaultPrefix: "CVSF",
	},
	{
		code: "purchase-order",
		name: "Purchase Order",
		defaultPrefix: "PO",
	},
	{
		code: "purchase-journal",
		name: "Purchase Journal",
		defaultPrefix: "PJ",
	},
	{
		code: "fixed-assets",
		name: "Fixed Assets",
		defaultPrefix: "FIXA",
	},
] as const satisfies ReadonlyArray<{
	code: TransactionNumberModuleCode;
	defaultPrefix: string;
	name: string;
}>;

export const TransactionNumberInputModeOptions = [
	"Auto",
	"Manual",
] as const satisfies readonly TransactionNumberInputMode[];

export const TransactionNumberScopeOptions = [
	{ label: "All branches", value: "all" },
	{ label: "Separate per branch", value: "branch" },
	{ label: "Shared selected branches", value: "shared" },
] as const satisfies ReadonlyArray<{
	label: string;
	value: TransactionNumberScope;
}>;

export const TransactionNumberStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly TransactionNumberStatus[];

export const TransactionNumberSetupTableColumns: Array<
	| {
			key: TransactionNumberSetupTableColumnKey;
			label: string;
			className: string;
	  }
	| {
			id: "actions";
			label: string;
			className: string;
	  }
> = [
	{ key: "moduleName", label: "Module", className: "w-[18rem]" },
	{ key: "inputMode", label: "Input", className: "w-[8rem]" },
	{ key: "scope", label: "Mode", className: "w-[10rem]" },
	{ key: "branchScope", label: "Branches", className: "w-[18rem]" },
	{ key: "prefix", label: "Prefix", className: "w-[9rem]" },
	{ key: "currentNumber", label: "Current", className: "w-[9rem]" },
	{ key: "nextNumber", label: "Next Number", className: "w-[16rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ id: "actions", label: "Actions", className: "w-[8rem]" },
];
