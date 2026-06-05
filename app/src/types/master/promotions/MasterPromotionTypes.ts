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

export type MasterPromotionAvailabilityMode = "One-time" | "Recurring";

export type MasterPromotionRecurringAvailability =
	| "First day of billing cycle"
	| "First day of month"
	| "First month of year";

export type MasterPromotionBillingCycle =
	| "Whole plan"
	| "1 billing cycle"
	| "2 billing cycles"
	| "3 billing cycles"
	| "4 billing cycles"
	| "5 billing cycles"
	| "6 billing cycles"
	| "7 billing cycles"
	| "8 billing cycles"
	| "9 billing cycles"
	| "10 billing cycles"
	| "11 billing cycles"
	| "12 billing cycles";

export type MasterPromotionTargetPlanId = string;

export type MasterPromotionRecord = {
	availabilityMode: MasterPromotionAvailabilityMode;
	billingCycle: MasterPromotionBillingCycle;
	code: string;
	description: string;
	discountKind: MasterPromotionDiscountKind;
	expiresAt: string | null;
	id: string;
	name: string;
	redemptions: number;
	redemptionLimit: number | null;
	recurringAvailability: MasterPromotionRecurringAvailability;
	status: MasterPromotionStatus;
	startsAt: string;
	targetPlanIds: MasterPromotionTargetPlanId[];
	type: MasterPromotionType;
	value: number;
};

export type MasterPromotionFormValues = {
	availabilityMode: MasterPromotionAvailabilityMode;
	billingCycle: MasterPromotionBillingCycle;
	code: string;
	description: string;
	discountKind: MasterPromotionDiscountKind;
	expirationMode: MasterPromotionExpirationMode;
	expiresAt: string;
	id?: string;
	limitMode: MasterPromotionLimitMode;
	name: string;
	redemptionLimit: number;
	recurringAvailability: MasterPromotionRecurringAvailability;
	status: MasterPromotionStatus;
	startsAt: string;
	targetPlanIds: MasterPromotionTargetPlanId[];
	type: MasterPromotionType;
	value: number;
};

export type MasterPromotionFormErrors = Partial<
	Record<keyof MasterPromotionFormValues, string>
>;

export type MasterPromotionTableColumnKey =
	| "billingCycle"
	| "name"
	| "startsAt"
	| "targetPlanIds"
	| "value"
	| "status"
	| "redemptions";
