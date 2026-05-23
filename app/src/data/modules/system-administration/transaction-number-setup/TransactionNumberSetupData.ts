import { TransactionNumberModuleOptions } from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import type {
	TransactionNumberApiEndpoint,
	TransactionNumberDatabaseTable,
	TransactionNumberModuleCode,
	TransactionNumberSetupFormValues,
	TransactionNumberSetupRecord,
	TransactionNumberUsageLog,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

export const TransactionNumberSetupInitialFormValues: TransactionNumberSetupFormValues =
	{
		moduleCode: "",
		prefix: "",
		padding: 8,
		startingNumber: 1,
		currentNumber: 1,
		scope: "all",
		branchIds: [],
		status: "Active",
		description: "",
	};

export const MockTransactionNumberSetups: TransactionNumberSetupRecord[] = [
	{
		id: "txn-setup-dv-main",
		moduleCode: "DV",
		moduleName: "Disbursement Voucher",
		prefix: "MAIN-DV-",
		padding: 8,
		startingNumber: 1,
		currentNumber: 101,
		scope: "branch",
		branchIds: ["branch-main"],
		status: "Active",
		description: "Main branch disbursement voucher sequence.",
		lastGeneratedNumber: "MAIN-DV-00000100",
		lastGeneratedAt: "2026-05-22T09:18:00.000Z",
	},
	{
		id: "txn-setup-dv-branch-imus",
		moduleCode: "DV",
		moduleName: "Disbursement Voucher",
		prefix: "BRIN-DV-",
		padding: 8,
		startingNumber: 1,
		currentNumber: 1,
		scope: "branch",
		branchIds: ["branch-north"],
		status: "Active",
		description: "Branch-specific disbursement sequence.",
	},
	{
		id: "txn-setup-cr-shared",
		moduleCode: "CR",
		moduleName: "Cash Receipt",
		prefix: "MAIN-CR-",
		padding: 8,
		startingNumber: 1,
		currentNumber: 42,
		scope: "all",
		branchIds: [],
		status: "Active",
		description: "Shared cash receipt sequence across all branches.",
		lastGeneratedNumber: "MAIN-CR-00000041",
		lastGeneratedAt: "2026-05-22T10:02:00.000Z",
	},
	{
		id: "txn-setup-jv-global",
		moduleCode: "JV",
		moduleName: "Journal Voucher",
		prefix: "MAIN-JV-",
		padding: 8,
		startingNumber: 1,
		currentNumber: 315,
		scope: "all",
		branchIds: [],
		status: "Active",
		description: "Company-wide journal voucher sequence.",
		lastGeneratedNumber: "MAIN-JV-00000314",
		lastGeneratedAt: "2026-05-21T16:40:00.000Z",
	},
	{
		id: "txn-setup-pr-shared",
		moduleCode: "PR",
		moduleName: "Purchase Request",
		prefix: "MAIN-PR-",
		padding: 6,
		startingNumber: 1,
		currentNumber: 72,
		scope: "shared",
		branchIds: ["branch-main", "branch-south"],
		status: "Active",
		description: "Purchase requests shared by head office and satellite.",
		lastGeneratedNumber: "MAIN-PR-000071",
		lastGeneratedAt: "2026-05-20T11:12:00.000Z",
	},
];

export const MockTransactionNumberUsageLogs: TransactionNumberUsageLog[] = [
	{
		id: "txn-log-dv-main-100",
		setupId: "txn-setup-dv-main",
		moduleCode: "DV",
		transactionNumber: "MAIN-DV-00000100",
		runningNumber: 100,
		branchId: "branch-main",
		status: "Committed",
		createdAt: "2026-05-22T09:18:00.000Z",
	},
	{
		id: "txn-log-cr-shared-41",
		setupId: "txn-setup-cr-shared",
		moduleCode: "CR",
		transactionNumber: "MAIN-CR-00000041",
		runningNumber: 41,
		branchId: "branch-main",
		status: "Committed",
		createdAt: "2026-05-22T10:02:00.000Z",
	},
	{
		id: "txn-log-jv-global-314",
		setupId: "txn-setup-jv-global",
		moduleCode: "JV",
		transactionNumber: "MAIN-JV-00000314",
		runningNumber: 314,
		branchId: "branch-south",
		status: "Committed",
		createdAt: "2026-05-21T16:40:00.000Z",
	},
];

export const TransactionNumberDatabaseTables: TransactionNumberDatabaseTable[] = [
	{
		name: "transaction_number_setups",
		purpose: "Stores one numbering rule per module and branch coverage.",
		columns: [
			"id uuid primary key",
			"module_code varchar(20) not null",
			"prefix varchar(50) not null",
			"padding smallint not null",
			"starting_number bigint not null",
			"current_number bigint not null",
			"scope varchar(20) not null",
			"status varchar(20) not null",
		],
	},
	{
		name: "transaction_number_setup_branches",
		purpose: "Links setup rows to branches when a sequence is branch-specific or shared by selected branches.",
		columns: [
			"setup_id uuid references transaction_number_setups(id)",
			"branch_id uuid references branches(id)",
			"primary key (setup_id, branch_id)",
		],
	},
	{
		name: "transaction_number_ledger",
		purpose: "Records every reserved or committed transaction number to enforce uniqueness.",
		columns: [
			"id uuid primary key",
			"setup_id uuid references transaction_number_setups(id)",
			"transaction_number varchar(100) not null unique",
			"running_number bigint not null",
			"branch_id uuid not null",
			"status varchar(20) not null",
			"created_at timestamp not null",
		],
	},
];

export const TransactionNumberApiEndpoints: TransactionNumberApiEndpoint[] = [
	{
		method: "GET",
		path: "/api/transaction-number-setups",
		purpose: "List setup rows with module, branch coverage, and next preview.",
	},
	{
		method: "POST",
		path: "/api/transaction-number-setups",
		purpose: "Create a numbering setup after overlap validation.",
	},
	{
		method: "PATCH",
		path: "/api/transaction-number-setups/{setupId}",
		purpose: "Update prefix, padding, current number, scope, or status.",
	},
	{
		method: "POST",
		path: "/api/transaction-number-setups/{setupId}/next-number",
		purpose: "Reserve the next unique number inside a database transaction.",
	},
];

export const TransactionNumberEdgeCases = [
	"Current number cannot be lower than the configured starting number.",
	"Active setups for the same module cannot cover the same branch.",
	"All-branch setups use one sequence for every branch.",
	"Generation must lock the setup row before incrementing current_number.",
	"Duplicate ledger entries are rejected by a unique transaction_number index.",
	"Voided transactions keep their numbers in the ledger and are not reused.",
] as const;

export function createTransactionNumberSetupFormValues(
	record: TransactionNumberSetupRecord,
): TransactionNumberSetupFormValues {
	return {
		moduleCode: record.moduleCode,
		prefix: record.prefix,
		padding: record.padding,
		startingNumber: record.startingNumber,
		currentNumber: record.currentNumber,
		scope: record.scope,
		branchIds: record.branchIds,
		status: record.status,
		description: record.description,
	};
}

export function createTransactionNumberSetupRecord(
	values: TransactionNumberSetupFormValues,
): TransactionNumberSetupRecord {
	const moduleCode = values.moduleCode || "DV";

	return {
		id: `txn-setup-${Date.now()}`,
		moduleCode,
		moduleName: getTransactionNumberModuleName(moduleCode),
		prefix: values.prefix.trim(),
		padding: values.padding,
		startingNumber: values.startingNumber,
		currentNumber: values.currentNumber,
		scope: values.scope,
		branchIds: createTransactionNumberBranchIds(values),
		status: values.status,
		description: values.description.trim(),
	};
}

export function updateTransactionNumberSetupRecord(
	record: TransactionNumberSetupRecord,
	values: TransactionNumberSetupFormValues,
): TransactionNumberSetupRecord {
	const moduleCode = values.moduleCode || record.moduleCode;

	return {
		...record,
		moduleCode,
		moduleName: getTransactionNumberModuleName(moduleCode),
		prefix: values.prefix.trim(),
		padding: values.padding,
		startingNumber: values.startingNumber,
		currentNumber: values.currentNumber,
		scope: values.scope,
		branchIds: createTransactionNumberBranchIds(values),
		status: values.status,
		description: values.description.trim(),
	};
}

function createTransactionNumberBranchIds(
	values: Pick<TransactionNumberSetupFormValues, "branchIds" | "scope">,
) {
	if (values.scope === "all") {
		return [];
	}

	if (values.scope === "branch") {
		return values.branchIds.slice(0, 1);
	}

	return values.branchIds;
}

export function getTransactionNumberModuleName(
	moduleCode: TransactionNumberModuleCode,
) {
	return (
		TransactionNumberModuleOptions.find((option) => option.code === moduleCode)
			?.name ?? moduleCode
	);
}
