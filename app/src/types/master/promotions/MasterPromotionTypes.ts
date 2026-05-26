export type MasterPromotionType =
	| "Promo Code"
	| "Coupon"
	| "Voucher"
	| "Event Promo";

export type MasterPromotionDiscountKind = "Percent" | "Fixed";

export type MasterPromotionExpirationMode =
	| "With expiration"
	| "No expiration";

export type MasterPromotionLimitMode = "Limited" | "Unlimited";

export type MasterPromotionStatus = "Active" | "Draft" | "Inactive";

export type MasterPromotionTargetPlanId = string;

export type MasterPromotionRecord = {
	code: string;
	description: string;
	discountKind: MasterPromotionDiscountKind;
	expiresAt: string | null;
	id: string;
	name: string;
	redemptions: number;
	redemptionLimit: number | null;
	status: MasterPromotionStatus;
	targetPlanIds: MasterPromotionTargetPlanId[];
	type: MasterPromotionType;
	value: number;
};

export type MasterPromotionFormValues = {
	code: string;
	description: string;
	discountKind: MasterPromotionDiscountKind;
	expirationMode: MasterPromotionExpirationMode;
	expiresAt: string;
	id?: string;
	limitMode: MasterPromotionLimitMode;
	name: string;
	redemptionLimit: number;
	status: MasterPromotionStatus;
	targetPlanIds: MasterPromotionTargetPlanId[];
	type: MasterPromotionType;
	value: number;
};

export type MasterPromotionFormErrors = Partial<
	Record<keyof MasterPromotionFormValues, string>
>;

export type MasterPromotionTableColumnKey =
	| "name"
	| "targetPlanIds"
	| "value"
	| "status"
	| "redemptions";
