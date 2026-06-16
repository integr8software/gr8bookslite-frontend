import type {
	TransactionNumberInputMode,
	TransactionNumberScope,
	TransactionNumberSetupTableColumnKey,
	TransactionNumberStatus,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

export const TransactionNumberSetupHref =
	"/system-administration/transaction-number-setup";

export const TransactionNumberSetupPaginationStorageKey =
	"system-administration.transaction-number-setup";

export const TransactionNumberInputModeOptions = [
	"Auto",
	"Manual",
] as const satisfies readonly TransactionNumberInputMode[];

export const TransactionNumberScopeOptions = [
	{ label: "All branches", value: "all" },
	{ label: "Separate per branch", value: "branch" },
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
