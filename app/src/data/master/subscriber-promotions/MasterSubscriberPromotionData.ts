import { MasterPromotionRecords } from "@/app/src/data/master/promotions/MasterPromotionData";
import {
	MasterSubscriptionCompanies,
	MasterSubscriptionPlans,
} from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import type {
	MasterSubscriptionBillingCycle,
	MasterSubscriptionCompanyRecord,
	MasterSubscriptionCompanyStatus,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";
import type {
	MasterSubscriberPromotionFormValues,
	MasterSubscriberPromotionRecord,
} from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";

export const MasterSubscriberPromotionRecords: MasterSubscriberPromotionRecord[] =
	[
		{
			assignedAt: "2026-04-25",
			assignmentMode: "Condition based",
			expiresAt: "2026-12-31",
			grantedBy: "Super Admin",
			id: "subpromo-gr8books-welcome20",
			invoiceNo: "INV-2026-0501",
			notes: "Granted to active paid subscribers during launch campaign.",
			ownerName: "John Dela Cruz",
			planName: "Growth Suite",
			promotionCode: "WELCOME20",
			promotionId: "promo-welcome20",
			promotionName: "Welcome Launch",
			status: "Used",
			subscriberId: "sub-gr8books",
			subscriberName: "Gr8Books HQ",
			usedAt: "2026-05-01",
		},
		{
			assignedAt: "2026-05-02",
			assignmentMode: "Chosen subscriber",
			expiresAt: "2026-08-31",
			grantedBy: "Billing Admin",
			id: "subpromo-demo-accounting100",
			invoiceNo: null,
			notes: "Manual starter coupon for trial conversion follow-up.",
			ownerName: "Jane Santos",
			planName: "Core Books",
			promotionCode: "ACCOUNTING100",
			promotionId: "coupon-accounting100",
			promotionName: "Accounting Starter",
			status: "Available",
			subscriberId: "sub-demo-trading",
			subscriberName: "Demo Trading Corp.",
			usedAt: null,
		},
		{
			assignedAt: "2026-03-15",
			assignmentMode: "Multiple selected",
			expiresAt: null,
			grantedBy: "Super Admin",
			id: "subpromo-laguna-addon-credit",
			invoiceNo: "INV-2026-0503",
			notes: "Voucher credit for high-volume branch rollout.",
			ownerName: "Emily Lim",
			planName: "Enterprise Ops",
			promotionCode: "ADDON-VCHR",
			promotionId: "voucher-addon-credit",
			promotionName: "Add-on Credit",
			status: "Used",
			subscriberId: "sub-laguna-manufacturing",
			subscriberName: "Laguna Manufacturing Inc.",
			usedAt: "2026-05-10",
		},
		{
			assignedAt: "2026-02-20",
			assignmentMode: "Random pick",
			expiresAt: "2026-05-15",
			grantedBy: "Campaign Ops",
			id: "subpromo-visayas-summit25",
			invoiceNo: null,
			notes: "Random retention offer for summit waitlist subscribers.",
			ownerName: "Miguel Reyes",
			planName: "Enterprise Ops",
			promotionCode: "SUMMIT25",
			promotionId: "event-summit25",
			promotionName: "Summit Attendee",
			status: "Expired",
			subscriberId: "sub-visayas-retail",
			subscriberName: "Visayas Retail Group",
			usedAt: null,
		},
		{
			assignedAt: "2026-05-18",
			assignmentMode: "Multiple selected",
			expiresAt: "2026-12-31",
			grantedBy: "Super Admin",
			id: "subpromo-laguna-welcome20",
			invoiceNo: null,
			notes: "Multi-subscriber renewal promotion for active enterprise tenants.",
			ownerName: "Emily Lim",
			planName: "Enterprise Ops",
			promotionCode: "WELCOME20",
			promotionId: "promo-welcome20",
			promotionName: "Welcome Launch",
			status: "Available",
			subscriberId: "sub-laguna-manufacturing",
			subscriberName: "Laguna Manufacturing Inc.",
			usedAt: null,
		},
	];

export const MasterSubscriberPromotionSubscriberOptions =
	MasterSubscriptionCompanies.map((subscriber) => ({
		billingCycle: subscriber.billingCycle,
		id: subscriber.id,
		label: `${subscriber.name} - ${subscriber.ownerName}`,
		name: subscriber.name,
		ownerName: subscriber.ownerName,
		planId: subscriber.planId,
		planName: getMasterSubscriberPromotionPlanName(subscriber.planId),
		status: subscriber.status,
	}));

export const MasterSubscriberPromotionPromotionOptions =
	MasterPromotionRecords.map((promotion) => ({
		code: promotion.code,
		id: promotion.id,
		label: `${promotion.name} - ${promotion.code}`,
		name: promotion.name,
		status: promotion.status,
		type: promotion.type,
	}));

export const MasterSubscriberPromotionPlanOptions =
	MasterSubscriptionPlans.map((plan) => ({
		id: plan.id,
		label: plan.name,
	}));

export const MasterSubscriberPromotionStatusConditionOptions = [
	"Active",
	"Trial",
	"Past Due",
	"Scheduled",
] as const satisfies readonly MasterSubscriptionCompanyStatus[];

export const MasterSubscriberPromotionBillingCycleConditionOptions = [
	"Monthly",
	"Every 3 months",
	"Annual",
	"Per transaction",
] as const satisfies readonly MasterSubscriptionBillingCycle[];

export const InitialMasterSubscriberPromotionFormValues: MasterSubscriberPromotionFormValues =
	{
		assignmentMode: "Chosen subscriber",
		conditionBillingCycles: [],
		conditionPlanIds: [],
		conditionStatuses: ["Active"],
		expiresAt: "",
		notes: "",
		promotionIds: [MasterPromotionRecords[0]?.id ?? ""].filter(Boolean),
		randomCount: 1,
		startsAt: "2026-05-26",
		subscriberIds: [MasterSubscriptionCompanies[0]?.id ?? ""].filter(Boolean),
	};

export function formatMasterSubscriberPromotionDate(value: string | null) {
	if (!value) {
		return "Not used";
	}

	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

export function formatMasterSubscriberPromotionExpiry(value: string | null) {
	if (!value) {
		return "No expiration";
	}

	return formatMasterSubscriberPromotionDate(value);
}

export function getMasterSubscriberPromotionAudience(
	values: MasterSubscriberPromotionFormValues,
) {
	switch (values.assignmentMode) {
		case "Chosen subscriber":
			return findSubscribersByIds(values.subscriberIds.slice(0, 1));
		case "Multiple selected":
			return findSubscribersByIds(values.subscriberIds);
		case "Random pick":
			return MasterSubscriptionCompanies.filter(
				(subscriber) => subscriber.status === "Active",
			)
				.slice()
				.sort((first, second) => first.name.localeCompare(second.name))
				.slice(0, Math.max(0, Math.floor(values.randomCount)));
		case "Condition based":
			return MasterSubscriptionCompanies.filter((subscriber) =>
				matchesSubscriberConditions(subscriber, values),
			);
	}
}

export function getMasterSubscriberPromotionPlanName(planId: string) {
	return (
		MasterSubscriptionPlans.find((plan) => plan.id === planId)?.name ??
		"Unknown plan"
	);
}

export function getMasterSubscriberPromotionSummaryLabel(
	values: MasterSubscriberPromotionFormValues,
) {
	const audience = getMasterSubscriberPromotionAudience(values);
	const promotionCount = values.promotionIds.length;
	const subscriberLabel =
		audience.length === 1 ? "subscriber" : "subscribers";
	const promotionLabel =
		promotionCount === 1 ? "promotion" : "promotions";

	return `${promotionCount} ${promotionLabel} to ${audience.length} ${subscriberLabel}`;
}

function findSubscribersByIds(subscriberIds: string[]) {
	const selectedIds = new Set(subscriberIds);

	return MasterSubscriptionCompanies.filter((subscriber) =>
		selectedIds.has(subscriber.id),
	);
}

function matchesSubscriberConditions(
	subscriber: MasterSubscriptionCompanyRecord,
	values: MasterSubscriberPromotionFormValues,
) {
	const matchesPlan =
		values.conditionPlanIds.length === 0 ||
		values.conditionPlanIds.includes(subscriber.planId);
	const matchesStatus =
		values.conditionStatuses.length === 0 ||
		values.conditionStatuses.includes(subscriber.status);
	const matchesBillingCycle =
		values.conditionBillingCycles.length === 0 ||
		values.conditionBillingCycles.includes(subscriber.billingCycle);

	return matchesPlan && matchesStatus && matchesBillingCycle;
}
