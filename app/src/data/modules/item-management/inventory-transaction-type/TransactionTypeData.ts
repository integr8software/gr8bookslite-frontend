import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { ModuleOption } from "@/app/src/data/shared/modules/ModuleOptionsData";
import { TransactionTypeModuleOptions } from "@/app/src/constants/modules/item-management/inventory-transaction-type/TransactionTypeConstants";
import type {
	TransactionType,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";

export const MockTransactionTypes: TransactionType[] = [
	createMockTransactionType({
		id: "transaction-type-gr-sales-return",
		name: "Sales Return",
		description: "Records customer-returned goods received back into inventory.",
		moduleId: "GR",
		moduleName: "Goods Receipt",
		accountNumber: "1010103001",
		accountTitle: "Accounts Receivables - Trade",
	}),
	createMockTransactionType({
		id: "transaction-type-gr-transfer",
		name: "Transfer",
		description: "Records items received from another warehouse or branch.",
		moduleId: "GR",
		moduleName: "Goods Receipt",
		accountNumber: "1010101001",
		accountTitle: "Cash on Hand",
	}),
	createMockTransactionType({
		id: "transaction-type-gr-free-items",
		name: "Free Items",
		description: "Records complimentary items received into inventory.",
		moduleId: "GR",
		moduleName: "Goods Receipt",
		accountNumber: "1010103003",
		accountTitle: "Advances To Suppliers",
	}),
	createMockTransactionType({
		id: "transaction-type-gr-gifts",
		name: "Gifts",
		description: "Records gifted items received for inventory tracking.",
		moduleId: "GR",
		moduleName: "Goods Receipt",
		accountNumber: "1010103004",
		accountTitle: "Advances To Officers and Employees",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-transfer",
		name: "Transfer",
		description: "Issues items out of inventory for transfer to another warehouse or branch.",
		moduleId: "GI",
		moduleName: "Goods Issue",
		accountNumber: "1010101001",
		accountTitle: "Cash on Hand",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-issuance",
		name: "Issuance",
		description: "Issues stock from inventory for approved internal use or release.",
		moduleId: "GI",
		moduleName: "Goods Issue",
		accountNumber: "1010101002",
		accountTitle: "Petty Cash Fund",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-purchase-return",
		name: "Purchase Return",
		description: "Issues goods out of inventory when returning items to a supplier.",
		moduleId: "GI",
		moduleName: "Goods Issue",
		accountNumber: "1010103002",
		accountTitle: "Accounts Receivables - Others",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-damaged-item",
		name: "Damaged Item",
		description: "Issues damaged stock out of available inventory for write-off or disposal.",
		moduleId: "GI",
		moduleName: "Goods Issue",
		accountNumber: "1010103004",
		accountTitle: "Advances To Officers and Employees",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-spoilage",
		name: "Spoilage",
		description: "Issues spoiled stock out of inventory for adjustment and accountability.",
		moduleId: "GI",
		moduleName: "Goods Issue",
		accountNumber: "1010103003",
		accountTitle: "Advances To Suppliers",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-expired-item",
		name: "Expired Item",
		description: "Issues expired stock out of inventory for removal or disposal.",
		moduleId: "GI",
		moduleName: "Goods Issue",
		accountNumber: "1010103001",
		accountTitle: "Accounts Receivables - Trade",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-bad-order",
		name: "Bad Order",
		description: "Issues unsellable or rejected stock out of inventory for tracking.",
		moduleId: "GI",
		moduleName: "Goods Issue",
		accountNumber: "1010103002",
		accountTitle: "Accounts Receivables - Others",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-freebies",
		name: "Freebies",
		description: "Issues promotional free items out of inventory for customer release.",
		moduleId: "GI",
		moduleName: "Goods Issue",
		accountNumber: "1010103004",
		accountTitle: "Advances To Officers and Employees",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-gifts",
		name: "Gifts",
		description: "Issues gifted items out of inventory for non-sale distribution.",
		moduleId: "GI",
		moduleName: "Goods Issue",
		accountNumber: "1010103003",
		accountTitle: "Advances To Suppliers",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-intercompany",
		name: "Intercompany",
		description: "Issues items out of inventory for transfer to another company entity.",
		moduleId: "GI",
		moduleName: "Goods Issue",
		accountNumber: "1010103001",
		accountTitle: "Accounts Receivables - Trade",
	}),
];

export const TransactionTypeInitialFormValues: TransactionTypeFormValues = {
	name: "",
	description: "",
	moduleIds: [],
	status: "Active",
	accountId: "",
};

export const TransactionTypeAvailableModuleOptions: ModuleOption[] =
	TransactionTypeModuleOptions.map((option) => ({ ...option }));

export function createTransactionTypeFormValues(
	transactionType: TransactionType,
): TransactionTypeFormValues {
	const legacyTransactionType = transactionType as TransactionType & {
		type?: string;
	};

	return {
		name: transactionType.name ?? legacyTransactionType.type ?? "",
		description: transactionType.description,
		moduleIds: getTransactionTypeModuleIds(transactionType),
		status: transactionType.status,
		accountId: transactionType.accountId ?? transactionType.accountCode ?? "",
	};
}

export function createTransactionTypeFromForm(
	values: TransactionTypeFormValues,
	account?: ModuleChartAccount,
	moduleOptions: ModuleOption[] = [],
): TransactionType {
	const moduleNames = getSelectedModuleNames(values.moduleIds, moduleOptions);

	return {
		id: `transaction-type-${Date.now()}`,
		name: values.name.trim(),
		description: values.description.trim(),
		moduleId: values.moduleIds[0] ?? "",
		moduleName: moduleNames[0] ?? "",
		moduleIds: values.moduleIds,
		moduleNames,
		status: values.status,
		accountId: account?.accountNumber,
		accountCode: account?.accountNumber,
		accountTitle: account?.accountName,
	};
}

export function updateTransactionTypeFromForm(
	transactionType: TransactionType,
	values: TransactionTypeFormValues,
	account?: ModuleChartAccount,
	moduleOptions: ModuleOption[] = [],
): TransactionType {
	const moduleNames = getSelectedModuleNames(values.moduleIds, moduleOptions);

	return {
		...transactionType,
		name: values.name.trim(),
		description: values.description.trim(),
		moduleId: values.moduleIds[0] ?? "",
		moduleName: moduleNames[0] ?? "",
		moduleIds: values.moduleIds,
		moduleNames,
		status: values.status,
		accountId: account?.accountNumber,
		accountCode: account?.accountNumber,
		accountTitle: account?.accountName,
	};
}

function getSelectedModuleNames(
	moduleIds: string[],
	moduleOptions: ModuleOption[],
) {
	return moduleIds.map(
		(moduleId) =>
			moduleOptions.find((option) => option.value === moduleId)?.label ??
			moduleId,
	);
}

function getTransactionTypeModuleIds(transactionType: TransactionType) {
	return transactionType.moduleIds?.length
		? [...transactionType.moduleIds]
		: transactionType.moduleId
			? [transactionType.moduleId]
			: [];
}

function createMockTransactionType({
	accountNumber,
	accountTitle,
	description,
	id,
	moduleId,
	moduleName,
	name,
	status = "Active",
}: {
	accountNumber: string;
	accountTitle: string;
	description: string;
	id: string;
	moduleId: string;
	moduleName: string;
	name: string;
	status?: TransactionType["status"];
}): TransactionType {
	return {
		id,
		name,
		description,
		moduleId,
		moduleName,
		moduleIds: [moduleId],
		moduleNames: [moduleName],
		accountId: accountNumber,
		accountCode: accountNumber,
		accountTitle,
		status,
	};
}

export function getTransactionTypeTableMinWidthClassName(columnCount: number) {
	return columnCount > 5 ? "min-w-[72rem]" : "min-w-[64rem]";
}
