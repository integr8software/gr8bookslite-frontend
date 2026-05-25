export type MasterCouponPromotionType = "Promo" | "Coupon" | "Voucher";

export type MasterCouponPromotionDiscountKind = "Percent" | "Fixed";

export type MasterCouponPromotionStatus = "Active" | "Draft" | "Inactive";

export type MasterCouponPromotionTarget =
	| "All Plans"
	| "Accounting"
	| "Inventory"
	| "Accounting + Inventory"
	| "Add-ons";

export type MasterCouponPromotionRecord = {
	code: string;
	discountKind: MasterCouponPromotionDiscountKind;
	expiresAt: string;
	id: string;
	name: string;
	redemptions: number;
	status: MasterCouponPromotionStatus;
	target: MasterCouponPromotionTarget;
	type: MasterCouponPromotionType;
	value: number;
};

export type MasterCouponPromotionFormValues = Pick<
	MasterCouponPromotionRecord,
	| "code"
	| "discountKind"
	| "expiresAt"
	| "name"
	| "status"
	| "target"
	| "type"
	| "value"
>;

export type MasterCouponPromotionFormErrors = Partial<
	Record<keyof MasterCouponPromotionFormValues, string>
>;
