export type DiscountType = "Percentage" | "Fixed";
export type DiscountStatus = "Active" | "Inactive";

export type Discount = {
	id: string;
	name: string;
	description: string;
	discountType: DiscountType;
	amount: number;
	moduleIds: string[];
	moduleNames: string[];
	status: DiscountStatus;
	accountId?: string;
	accountCode?: string;
	accountTitle?: string;
};

export type DiscountManagementFormValues = {
	name: string;
	description: string;
	discountType: DiscountType;
	amount: string;
	moduleIds: string[];
	status: DiscountStatus;
	accountId: string;
};

export type DiscountManagementFormErrors = Partial<
	Record<keyof DiscountManagementFormValues, string>
>;

export type DiscountManagementActionMode = "add" | "edit" | "view";

export type DiscountManagementTableColumnKey =
	| "name"
	| "description"
	| "amountLabel"
	| "accountLabel"
	| "moduleLabel"
	| "status";

export type DiscountManagementTableRecord = Discount & {
	amountLabel: string;
	accountLabel: string;
	moduleLabel: string;
	valueLabel: string;
};
