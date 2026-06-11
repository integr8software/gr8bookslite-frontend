import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { ModuleOption } from "@/app/src/data/shared/modules/ModuleOptionsData";
import type {
	Discount,
	DiscountManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";

export const MockDiscounts: Discount[] = [
	{
		id: "d_001",
		name: "Prompt Payment Discount",
		description: "Encourages customers to pay invoices before the due date.",
		discountType: "Percentage",
		amount: 5,
		moduleIds: ["sales-invoice", "collection-receipt"],
		moduleNames: ["Sales Invoice", "Collection Receipt"],
		status: "Active",
		accountId: "bdo-bank",
		accountCode: "1110",
		accountTitle: "Cash in Bank - BDO",
	},
	{
		id: "d_002",
		name: "Product Discount",
		description: "Applies item-level discounts for selected products.",
		discountType: "Fixed",
		amount: 100,
		moduleIds: ["sales-invoice"],
		moduleNames: ["Sales Invoice"],
		status: "Active",
		accountId: "accounts-receivable-trade",
		accountCode: "1010200001",
		accountTitle: "Accounts Receivable - Trade",
	},
	{
		id: "d_003",
		name: "Volume Discount",
		description: "Rewards customers for meeting quantity or order value thresholds.",
		discountType: "Percentage",
		amount: 10,
		moduleIds: ["purchase-order"],
		moduleNames: ["Purchase Order"],
		status: "Active",
		accountId: "accounts-receivable",
		accountCode: "1210",
		accountTitle: "Accounts Receivable",
	},
	{
		id: "d_004",
		name: "Promo Discount",
		description: "Supports temporary promotional campaigns and seasonal offers.",
		discountType: "Fixed",
		amount: 250,
		moduleIds: ["sales-invoice"],
		moduleNames: ["Sales Invoice"],
		status: "Inactive",
		accountId: "operating-expenses",
		accountCode: "5200",
		accountTitle: "Operating Expenses",
	},
	{
		id: "d_005",
		name: "Trade Discount",
		description: "Applies negotiated discounts for trade customers or partner pricing.",
		discountType: "Percentage",
		amount: 7.5,
		moduleIds: ["sales-invoice"],
		moduleNames: ["Sales Invoice"],
		status: "Active",
		accountId: "accounts-receivable-non-trade",
		accountCode: "1010200002",
		accountTitle: "Accounts Receivable - Non-trade",
	},
];

export const DiscountManagementInitialFormValues: DiscountManagementFormValues =
	{
		name: "",
		description: "",
		discountType: "Percentage",
		amount: "",
		moduleIds: [],
		status: "Active",
		accountId: "",
	};

export function createDiscountManagementFormValues(
	discount: Discount,
): DiscountManagementFormValues {
	const legacyDiscount = discount as Discount & {
		name?: string;
		percentage?: number;
	};

	return {
		name: legacyDiscount.name ?? discount.description,
		description: discount.description,
		discountType: discount.discountType ?? "Percentage",
		amount: String(discount.amount ?? legacyDiscount.percentage ?? ""),
		moduleIds: [...(discount.moduleIds ?? [])],
		status: discount.status ?? "Active",
		accountId: discount.accountId ?? "",
	};
}

export function createDiscountFromForm(
	values: DiscountManagementFormValues,
	account?: ModuleChartAccount,
	moduleOptions: ModuleOption[] = [],
): Discount {
	return {
		id: `d_${Date.now().toString(36)}`,
		name: values.name.trim(),
		description: values.description.trim(),
		discountType: values.discountType,
		amount: Number(values.amount),
		moduleIds: values.moduleIds,
		moduleNames: getSelectedModuleNames(values.moduleIds, moduleOptions),
		status: values.status,
		accountId: account?.accountNumber,
		accountCode: account?.accountNumber,
		accountTitle: account?.accountName,
	};
}

export function updateDiscountFromForm(
	discount: Discount,
	values: DiscountManagementFormValues,
	account?: ModuleChartAccount,
	moduleOptions: ModuleOption[] = [],
): Discount {
	return {
		...discount,
		name: values.name.trim(),
		description: values.description.trim(),
		discountType: values.discountType,
		amount: Number(values.amount),
		moduleIds: values.moduleIds,
		moduleNames: getSelectedModuleNames(values.moduleIds, moduleOptions),
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
	const nameById = new Map(
		moduleOptions.map((option) => [option.value, option.label]),
	);

	return moduleIds.map((moduleId) => nameById.get(moduleId) ?? moduleId);
}
