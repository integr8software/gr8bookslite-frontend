import type {
	MasterPromotionDiscountKind,
	MasterPromotionType,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";
import type {
	MasterSubscriptionBillingCycle,
	MasterSubscriptionCompanyStatus,
	MasterSubscriptionQuote,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";

export type WorkspaceBillingPaymentMethodRecord = {
	brand: string;
	expiryLabel: string;
	holderName: string;
	id: string;
	isDefault: boolean;
	label: string;
	last4: string;
};

export type WorkspaceBillingPromotionOption = {
	assignmentId: string;
	code: string;
	description: string;
	discountAmount: number;
	discountKind: MasterPromotionDiscountKind;
	expiresAt: string | null;
	id: string;
	name: string;
	type: MasterPromotionType;
	value: number;
};

export type WorkspaceBillingCompanyAccount = {
	appliedPromotion: WorkspaceBillingPromotionOption | null;
	baseAmount: number;
	billingCycle: MasterSubscriptionBillingCycle;
	branchCount: number;
	companyCount: number;
	discountAmount: number;
	durationMonths: number;
	eligiblePromotions: WorkspaceBillingPromotionOption[];
	id: string;
	name: string;
	ownerName: string;
	overageAmount: number;
	planId: string;
	planName: string;
	quote: MasterSubscriptionQuote | null;
	renewalDate: string;
	status: MasterSubscriptionCompanyStatus;
	subtotal: number;
	totalDue: number;
	userCount: number;
};

export type WorkspacePromotionCodeFormValues = {
	code: string;
};

export type WorkspacePromotionCodeFormErrors = Partial<
	Record<keyof WorkspacePromotionCodeFormValues, string>
>;

