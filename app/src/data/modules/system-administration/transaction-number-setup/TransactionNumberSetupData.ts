import type {
	TransactionNumberSetupFormValues,
	TransactionNumberSetupRecord,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";
import type { WorkspaceCompanyRecord } from "@/app/src/types/workspace/WorkspaceCompanyTypes";

export const TransactionNumberSetupInitialFormValues: TransactionNumberSetupFormValues =
	{
		moduleCode: "",
		inputMode: "Auto",
		prefix: "",
		padding: 6,
		startingNumber: 1,
		currentNumber: 1,
		scope: "all",
		branchIds: [],
		status: "Active",
	};

export type TransactionNumberSetupBranchOption = {
	id: string;
	code: string;
	name: string;
};

export function createTransactionNumberSetupFormValues(
	record: TransactionNumberSetupRecord,
): TransactionNumberSetupFormValues {
	return {
		moduleCode: record.moduleCode,
		inputMode: record.inputMode,
		prefix: record.prefix,
		padding: record.padding,
		startingNumber: record.startingNumber,
		currentNumber: record.currentNumber,
		scope: record.scope,
		branchIds: record.branchIds,
		status: record.status,
	};
}

export function getTransactionNumberSetupBranchOptions(
	companies: WorkspaceCompanyRecord[],
): TransactionNumberSetupBranchOption[] {
	return companies
		.flatMap((company) => company.branches ?? [])
		.filter((branch) => branch.status === "Active")
		.map((branch) => ({
			code: branch.code,
			id: branch.id,
			name: branch.name,
		}))
		.sort((first, second) => first.name.localeCompare(second.name));
}

export function updateTransactionNumberSetupRecord(
	record: TransactionNumberSetupRecord,
	values: TransactionNumberSetupFormValues,
): TransactionNumberSetupRecord {
	const moduleCode = values.moduleCode || record.moduleCode;

	return {
		...record,
		moduleCode,
		moduleName: record.moduleName,
		inputMode: values.inputMode,
		prefix: values.prefix.trim(),
		padding: values.padding,
		startingNumber: values.startingNumber,
		currentNumber: values.currentNumber,
		scope: values.scope,
		branchIds: createTransactionNumberBranchIds(values),
		status: values.status,
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
