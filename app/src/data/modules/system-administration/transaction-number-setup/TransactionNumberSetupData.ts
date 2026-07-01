import type {
	TransactionNumberSetupFormValues,
	TransactionNumberSetupRecord,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

export const TransactionNumberSetupInitialFormValues: TransactionNumberSetupFormValues =
	{
		moduleCode: "",
		inputMode: "Auto",
		prefix: "",
		suffix: "",
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
		suffix: record.suffix,
		padding: record.padding,
		startingNumber: record.startingNumber,
		currentNumber: record.currentNumber,
		scope: record.scope,
		branchIds: record.branchIds,
		status: record.status,
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
		moduleName: record.moduleName,
		inputMode: values.inputMode,
		prefix: values.prefix.trim(),
		suffix: values.suffix.trim(),
		padding: getNumericFormValue(values.padding, record.padding),
		startingNumber: getNumericFormValue(
			values.startingNumber,
			record.startingNumber,
		),
		currentNumber: getNumericFormValue(
			values.currentNumber,
			record.currentNumber,
		),
		scope: values.scope,
		branchIds: createTransactionNumberBranchIds(values),
		status: values.status,
	};
}

function getNumericFormValue(value: number | "", fallback: number) {
	return value === "" ? fallback : value;
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
