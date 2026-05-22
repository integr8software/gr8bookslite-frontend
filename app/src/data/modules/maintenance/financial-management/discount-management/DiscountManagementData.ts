import type { ChartAccount } from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import type {
	Discount,
	DiscountManagementFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";

export const MockDiscounts: Discount[] = [
	{
		id: "d_001",
		description: "Early payment discount",
		percentage: 5,
		accountId: "bdo-bank",
		accountCode: "1110",
		accountTitle: "Cash in Bank - BDO",
	},
	{
		id: "d_002",
		description: "Volume purchase discount",
		percentage: 10,
		accountId: "accounts-receivable",
		accountCode: "1210",
		accountTitle: "Accounts Receivable",
	},
	{
		id: "d_003",
		description: "Seasonal promo discount",
		percentage: 15,
		accountId: "operating-expenses",
		accountCode: "5200",
		accountTitle: "Operating Expenses",
	},
];

export const DiscountManagementInitialFormValues: DiscountManagementFormValues =
	{
		description: "",
		percentage: "",
		accountId: "",
	};

export function createDiscountManagementFormValues(
	discount: Discount,
): DiscountManagementFormValues {
	return {
		description: discount.description,
		percentage: String(discount.percentage),
		accountId: discount.accountId ?? "",
	};
}

export function createDiscountFromForm(
	values: DiscountManagementFormValues,
	account?: ChartAccount,
): Discount {
	return {
		id: `d_${Date.now().toString(36)}`,
		description: values.description.trim(),
		percentage: Number(values.percentage),
		accountId: account?.id,
		accountCode: account?.accountNumber,
		accountTitle: account?.accountName,
	};
}

export function updateDiscountFromForm(
	discount: Discount,
	values: DiscountManagementFormValues,
	account?: ChartAccount,
): Discount {
	return {
		...discount,
		description: values.description.trim(),
		percentage: Number(values.percentage),
		accountId: account?.id,
		accountCode: account?.accountNumber,
		accountTitle: account?.accountName,
	};
}
