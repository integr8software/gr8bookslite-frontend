import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import type { FormSignatoryModuleOption } from "@/app/src/types/modules/maintenance/form-signatory/FormSignatoryTypes";
import type {
	TransactionType,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

export const MockTransactionTypes: TransactionType[] = [
	createMockTransactionType({
		id: "transaction-type-gr-sales-return",
		name: "Sales Return",
		description: "Records customer-returned goods received back into inventory.",
		moduleId: "inventory-goods-receipt",
		moduleName: "Goods Receipt",
		accountNumber: "1010200001",
		accountTitle: "Accounts Receivable - Trade",
	}),
	createMockTransactionType({
		id: "transaction-type-gr-transfer",
		name: "Transfer",
		description: "Records items received from another warehouse or branch.",
		moduleId: "inventory-goods-receipt",
		moduleName: "Goods Receipt",
		accountNumber: "1010101001",
		accountTitle: "Cash on Hand",
	}),
	createMockTransactionType({
		id: "transaction-type-gr-free-items",
		name: "Free Items",
		description: "Records complimentary items received into inventory.",
		moduleId: "inventory-goods-receipt",
		moduleName: "Goods Receipt",
		accountNumber: "1010300002",
		accountTitle: "Advances to Suppliers",
	}),
	createMockTransactionType({
		id: "transaction-type-gr-gifts",
		name: "Gifts",
		description: "Records gifted items received for inventory tracking.",
		moduleId: "inventory-goods-receipt",
		moduleName: "Goods Receipt",
		accountNumber: "1010300001",
		accountTitle: "Advances to Employees",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-transfer",
		name: "Transfer",
		description: "Issues items out of inventory for transfer to another warehouse or branch.",
		moduleId: "inventory-goods-issue",
		moduleName: "Goods Issue",
		accountNumber: "1010101001",
		accountTitle: "Cash on Hand",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-issuance",
		name: "Issuance",
		description: "Issues stock from inventory for approved internal use or release.",
		moduleId: "inventory-goods-issue",
		moduleName: "Goods Issue",
		accountNumber: "1010101002",
		accountTitle: "Petty Cash Fund",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-purchase-return",
		name: "Purchase Return",
		description: "Issues goods out of inventory when returning items to a supplier.",
		moduleId: "inventory-goods-issue",
		moduleName: "Goods Issue",
		accountNumber: "1010200002",
		accountTitle: "Accounts Receivable - Non-trade",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-damaged-item",
		name: "Damaged Item",
		description: "Issues damaged stock out of available inventory for write-off or disposal.",
		moduleId: "inventory-goods-issue",
		moduleName: "Goods Issue",
		accountNumber: "1010300001",
		accountTitle: "Advances to Employees",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-spoilage",
		name: "Spoilage",
		description: "Issues spoiled stock out of inventory for adjustment and accountability.",
		moduleId: "inventory-goods-issue",
		moduleName: "Goods Issue",
		accountNumber: "1010300002",
		accountTitle: "Advances to Suppliers",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-expired-item",
		name: "Expired Item",
		description: "Issues expired stock out of inventory for removal or disposal.",
		moduleId: "inventory-goods-issue",
		moduleName: "Goods Issue",
		accountNumber: "1010200001",
		accountTitle: "Accounts Receivable - Trade",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-bad-order",
		name: "Bad Order",
		description: "Issues unsellable or rejected stock out of inventory for tracking.",
		moduleId: "inventory-goods-issue",
		moduleName: "Goods Issue",
		accountNumber: "1010200002",
		accountTitle: "Accounts Receivable - Non-trade",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-freebies",
		name: "Freebies",
		description: "Issues promotional free items out of inventory for customer release.",
		moduleId: "inventory-goods-issue",
		moduleName: "Goods Issue",
		accountNumber: "1010300001",
		accountTitle: "Advances to Employees",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-gifts",
		name: "Gifts",
		description: "Issues gifted items out of inventory for non-sale distribution.",
		moduleId: "inventory-goods-issue",
		moduleName: "Goods Issue",
		accountNumber: "1010300002",
		accountTitle: "Advances to Suppliers",
	}),
	createMockTransactionType({
		id: "transaction-type-gi-intercompany",
		name: "Intercompany",
		description: "Issues items out of inventory for transfer to another company entity.",
		moduleId: "inventory-goods-issue",
		moduleName: "Goods Issue",
		accountNumber: "1010200001",
		accountTitle: "Accounts Receivable - Trade",
	}),
];

export const TransactionTypeInitialFormValues: TransactionTypeFormValues = {
	name: "",
	description: "",
	moduleId: "",
	status: "Active",
	accountId: "",
};

export function createTransactionTypeFormValues(
	transactionType: TransactionType,
): TransactionTypeFormValues {
	const legacyTransactionType = transactionType as TransactionType & {
		type?: string;
	};

	return {
		name: transactionType.name ?? legacyTransactionType.type ?? "",
		description: transactionType.description,
		moduleId: transactionType.moduleId ?? "",
		status: transactionType.status,
		accountId: transactionType.accountId ?? transactionType.accountCode ?? "",
	};
}

export function createTransactionTypeFromForm(
	values: TransactionTypeFormValues,
	account?: ChartAccount,
	moduleOptions: FormSignatoryModuleOption[] = [],
): TransactionType {
	return {
		id: `transaction-type-${Date.now()}`,
		name: values.name.trim(),
		description: values.description.trim(),
		moduleId: values.moduleId,
		moduleName: getSelectedModuleName(values.moduleId, moduleOptions),
		status: values.status,
		accountId: account?.accountNumber,
		accountCode: account?.accountNumber,
		accountTitle: account?.accountName,
	};
}

export function updateTransactionTypeFromForm(
	transactionType: TransactionType,
	values: TransactionTypeFormValues,
	account?: ChartAccount,
	moduleOptions: FormSignatoryModuleOption[] = [],
): TransactionType {
	return {
		...transactionType,
		name: values.name.trim(),
		description: values.description.trim(),
		moduleId: values.moduleId,
		moduleName: getSelectedModuleName(values.moduleId, moduleOptions),
		status: values.status,
		accountId: account?.accountNumber,
		accountCode: account?.accountNumber,
		accountTitle: account?.accountName,
	};
}

function getSelectedModuleName(
	moduleId: string,
	moduleOptions: FormSignatoryModuleOption[],
) {
	return (
		moduleOptions.find((option) => option.value === moduleId)?.label ??
		moduleId
	);
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
		accountId: accountNumber,
		accountCode: accountNumber,
		accountTitle,
		status,
	};
}
