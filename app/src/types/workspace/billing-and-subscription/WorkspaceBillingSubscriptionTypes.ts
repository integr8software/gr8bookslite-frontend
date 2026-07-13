import type {
	MasterPromotionDiscountKind,
	MasterPromotionType,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";
import type {
	MasterSubscriptionBillingCycle,
	MasterSubscriptionCompanyStatus,
	MasterSubscriptionQuote,
	MasterSubscriptionUnit,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";
import type { BillingMode } from "@/app/src/data/billing/BillingTypes";

export type WorkspaceBillingPromotionType = Extract<
	MasterPromotionType,
	"Coupon" | "Voucher" | "Promo Code"
>;

export type WorkspaceBillingPromotionApplicationMode =
	| "Possession"
	| "Typed code";

export type WorkspaceBillingPaymentMethodRecord = {
	brand: string;
	expiryLabel: string;
	holderName: string;
	id: string;
	isDefault: boolean;
	label: string;
	last4: string;
};

export type WorkspaceBillingPlanPriceBreakdown = {
	discountAmount: number;
	discountPercent: number;
	listAmount: number;
	netAmount: number;
	tooltip: string;
};

export type WorkspaceBillingPromotionOption = {
	applicationMode: WorkspaceBillingPromotionApplicationMode;
	assignmentId: string;
	code: string;
	description: string;
	discountAmount: number;
	discountKind: MasterPromotionDiscountKind;
	expiresAt: string | null;
	id: string;
	name: string;
	type: WorkspaceBillingPromotionType;
	value: number;
};

export type WorkspaceBillingAddOnQuote = {
	actualCount: number;
	billingAmount: number;
	extraCount: number;
	grossBillingAmount: number;
	grossMonthlyAmount: number;
	includedCount: number;
	key: MasterSubscriptionUnit;
	label: string;
	monthlyAmount: number;
	monthlyRate: number;
	reductionAmount: number;
	reductionPercent: number;
	reductionTooltip: string;
};

export type WorkspaceBillingRenewalState =
	| "Overdue"
	| "Due today"
	| "Due soon"
	| "Scheduled";

export type WorkspaceBillingSubscriberAccount = {
	billingCycle: MasterSubscriptionBillingCycle;
	id: string;
	name: string;
	ownerName: string;
	planName: string;
	renewalDate: string;
	status: MasterSubscriptionCompanyStatus;
};

export type WorkspaceBillingCompanyAccount = {
	addOnTotal: number;
	addOns: WorkspaceBillingAddOnQuote[];
	appliedPromotion: WorkspaceBillingPromotionOption | null;
	baseAmount: number;
	billingMode: BillingMode;
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
	paymentActionLabel: "Pay" | "Pay ahead";
	planId: string;
	planListAmount: number;
	planName: string;
	planPrice: WorkspaceBillingPlanPriceBreakdown;
	possessedPromotions: WorkspaceBillingPromotionOption[];
	quote: MasterSubscriptionQuote | null;
	renewalDate: string;
	renewalState: WorkspaceBillingRenewalState;
	renewalStatusLabel: string;
	status: MasterSubscriptionCompanyStatus;
	subscriberId: string;
	subscriberName: string;
	subtotal: number;
	totalDue: number;
	trialDaysRemaining: number | null;
	trialEndsAt: string | null;
	trialStatusLabel: string | null;
	userCount: number;
};

export type WorkspacePromotionCodeFormValues = {
	code: string;
};

export type WorkspacePromotionCodeFormErrors = Partial<
	Record<keyof WorkspacePromotionCodeFormValues, string>
>;
