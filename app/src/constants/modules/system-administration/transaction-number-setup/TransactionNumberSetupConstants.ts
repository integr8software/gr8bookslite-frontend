import type {
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
	"DV",
	"CR",
	"JV",
	"PR",
] as const satisfies readonly TransactionNumberModuleCode[];

export const TransactionNumberModuleOptions = [
	{
		code: "DV",
		name: "Disbursement Voucher",
		defaultPrefix: "MAIN-DV-",
	},
	{
		code: "CR",
		name: "Cash Receipt",
		defaultPrefix: "MAIN-CR-",
	},
	{
		code: "JV",
		name: "Journal Voucher",
		defaultPrefix: "MAIN-JV-",
	},
	{
		code: "PR",
		name: "Purchase Request",
		defaultPrefix: "MAIN-PR-",
	},
] as const satisfies ReadonlyArray<{
	code: TransactionNumberModuleCode;
	defaultPrefix: string;
	name: string;
}>;

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
	{ key: "moduleName", label: "Module", className: "w-[16rem]" },
	{ key: "scope", label: "Mode", className: "w-[10rem]" },
	{ key: "branchScope", label: "Branches", className: "w-[18rem]" },
	{ key: "prefix", label: "Prefix", className: "w-[12rem]" },
	{ key: "currentNumber", label: "Current", className: "w-[9rem]" },
	{ key: "nextNumber", label: "Next Number", className: "w-[16rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ id: "actions", label: "Actions", className: "w-[12rem]" },
];
