import type {
	MasterSubscriptionBillingCycle,
	MasterSubscriptionCompanyStatus,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";

export type MasterSubscriberPromotionStatus =
	| "Available"
	| "Used"
	| "Expired"
	| "Revoked";

export type MasterSubscriberPromotionAssignmentMode =
	| "Chosen subscriber"
	| "Condition based"
	| "Multiple selected"
	| "Random pick";

export type MasterSubscriberPromotionRecord = {
	assignedAt: string;
	assignmentMode: MasterSubscriberPromotionAssignmentMode;
	expiresAt: string | null;
	grantedBy: string;
	id: string;
	invoiceNo: string | null;
	notes: string;
	ownerName: string;
	planName: string;
	promotionCode: string;
	promotionId: string;
	promotionName: string;
	status: MasterSubscriberPromotionStatus;
	subscriberId: string;
	subscriberName: string;
	usedAt: string | null;
};

export type MasterSubscriberPromotionFormValues = {
	assignmentMode: MasterSubscriberPromotionAssignmentMode;
	conditionBillingCycles: MasterSubscriptionBillingCycle[];
	conditionPlanIds: string[];
	conditionStatuses: MasterSubscriptionCompanyStatus[];
	expiresAt: string;
	notes: string;
	promotionIds: string[];
	randomCount: number;
	startsAt: string;
	subscriberIds: string[];
};

export type MasterSubscriberPromotionFormErrors = Partial<
	Record<keyof MasterSubscriberPromotionFormValues, string>
>;

export type MasterSubscriberPromotionTableColumnKey =
	| "subscriberName"
	| "promotionName"
	| "status"
	| "assignmentMode"
	| "assignedAt"
	| "usedAt"
	| "expiresAt";
