export type MasterPromotionType =
	| "Promo Code"
	| "Coupon"
	| "Voucher"
	| "Event Promo";

export type MasterPromotionDiscountKind = "Percent" | "Fixed";

export type MasterPromotionStatus = "Active" | "Draft" | "Inactive";

export type MasterPromotionTarget =
	| "All Plans"
	| "Accounting"
	| "Inventory"
	| "Accounting + Inventory"
	| "Add-ons"
	| "Event Attendees";

export type MasterPromotionRecord = {
	code: string;
	description: string;
	discountKind: MasterPromotionDiscountKind;
	expiresAt: string;
	id: string;
	name: string;
	redemptions: number;
	status: MasterPromotionStatus;
	target: MasterPromotionTarget;
	type: MasterPromotionType;
	value: number;
};

export type MasterPromotionFormValues = Pick<
	MasterPromotionRecord,
	| "code"
	| "description"
	| "discountKind"
	| "expiresAt"
	| "name"
	| "status"
	| "target"
	| "type"
	| "value"
> & {
	id?: string;
};

export type MasterPromotionFormErrors = Partial<
	Record<keyof MasterPromotionFormValues, string>
>;

export type MasterPromotionTableColumnKey =
	| "name"
	| "target"
	| "value"
	| "status"
	| "redemptions";
