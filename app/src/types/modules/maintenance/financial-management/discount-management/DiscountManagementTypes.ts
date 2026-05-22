export type Discount = {
	id: string;
	description: string;
	percentage: number;
	accountId?: string;
	accountCode?: string;
	accountTitle?: string;
};

export type DiscountManagementFormValues = {
	description: string;
	percentage: string;
	accountId: string;
};

export type DiscountManagementFormErrors = Partial<
	Record<keyof DiscountManagementFormValues, string>
>;

export type DiscountManagementActionMode = "add" | "edit" | "view";

export type DiscountManagementTableColumnKey =
	| "description"
	| "percentage"
	| "accountLabel";

export type DiscountManagementTableRecord = Discount & {
	accountLabel: string;
};
