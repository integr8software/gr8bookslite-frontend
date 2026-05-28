import type {
	MasterPromotionAvailabilityMode,
	MasterPromotionBillingCycle,
	MasterPromotionDiscountKind,
	MasterPromotionExpirationMode,
	MasterPromotionLimitMode,
	MasterPromotionRecurringAvailability,
	MasterPromotionStatus,
	MasterPromotionTableColumnKey,
	MasterPromotionType,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";
import { MasterPlanAndPackageRecords } from "@/app/src/data/master/plan-and-packages/MasterPlanAndPackageData";

export const MasterPromotionsHref = "/master/promotions";

export const MasterPromotionAddHref = `${MasterPromotionsHref}/add`;

export function getMasterPromotionViewHref(recordId: string) {
	return `${MasterPromotionsHref}/view/${recordId}`;
}

export function getMasterPromotionEditHref(recordId: string) {
	return `${MasterPromotionsHref}/edit/${recordId}`;
}

export function getMasterPromotionEditFromViewHref(recordId: string) {
	return `${getMasterPromotionEditHref(recordId)}?from=view`;
}

export const MasterPromotionPaginationStorageKey = "master-promotions";

export const MasterPromotionTypeOptions = [
	"Promo Code",
	"Coupon",
	"Voucher",
	"Event Promo",
] as const satisfies readonly MasterPromotionType[];

export const MasterPromotionDiscountKindOptions = [
	"Percent",
	"Fixed",
] as const satisfies readonly MasterPromotionDiscountKind[];

export const MasterPromotionExpirationModeOptions = [
	"With expiration",
	"No expiration",
] as const satisfies readonly MasterPromotionExpirationMode[];

export const MasterPromotionLimitModeOptions = [
	"Unlimited",
	"Limited",
] as const satisfies readonly MasterPromotionLimitMode[];

export const MasterPromotionAvailabilityModeOptions = [
	"One-time",
	"Recurring",
] as const satisfies readonly MasterPromotionAvailabilityMode[];

export const MasterPromotionRecurringAvailabilityOptions = [
	"First day of billing cycle",
	"First day of month",
	"First month of year",
] as const satisfies readonly MasterPromotionRecurringAvailability[];

export const MasterPromotionBillingCycleOptions = [
	"Whole plan",
	"1 billing cycle",
	"2 billing cycles",
	"3 billing cycles",
	"4 billing cycles",
	"5 billing cycles",
	"6 billing cycles",
	"7 billing cycles",
	"8 billing cycles",
	"9 billing cycles",
	"10 billing cycles",
	"11 billing cycles",
	"12 billing cycles",
] as const satisfies readonly MasterPromotionBillingCycle[];

export const MasterPromotionAllPlansTarget = "all-plans";

export const MasterPromotionTargetOptions = [
	{
		description: "Every active and future plan can receive this promotion.",
		label: "Global",
		name: "All Plans",
		value: MasterPromotionAllPlansTarget,
	},
	...MasterPlanAndPackageRecords.map((plan) => ({
		description: plan.description,
		label: "Plan",
		name: plan.name,
		value: plan.id,
	})),
];

export function normalizeMasterPromotionTargetPlanIds(
	nextTargetPlanIds: string[],
	currentTargetPlanIds: string[] = [],
) {
	const uniqueTargetPlanIds = Array.from(
		new Set(nextTargetPlanIds.filter(Boolean)),
	);
	const includesAllPlans = uniqueTargetPlanIds.includes(
		MasterPromotionAllPlansTarget,
	);

	if (!includesAllPlans) {
		return uniqueTargetPlanIds;
	}

	const currentIncludesAllPlans = currentTargetPlanIds.includes(
		MasterPromotionAllPlansTarget,
	);

	if (currentIncludesAllPlans && uniqueTargetPlanIds.length > 1) {
		return uniqueTargetPlanIds.filter(
			(targetPlanId) => targetPlanId !== MasterPromotionAllPlansTarget,
		);
	}

	return [MasterPromotionAllPlansTarget];
}

export function getMasterPromotionTargetLabels(targetPlanIds: string[]) {
	const normalizedTargetPlanIds = normalizeMasterPromotionTargetPlanIds(
		targetPlanIds,
	);

	return normalizedTargetPlanIds.map(
		(targetPlanId) =>
			MasterPromotionTargetOptions.find(
				(option) => option.value === targetPlanId,
			)?.name ?? targetPlanId,
	);
}

export function getMasterPromotionTargetSummary(targetPlanIds: string[]) {
	const targetLabels = getMasterPromotionTargetLabels(targetPlanIds);

	if (targetLabels.length === 0) {
		return "No target plans";
	}

	if (targetLabels.length <= 2) {
		return targetLabels.join(", ");
	}

	return `${targetLabels.slice(0, 2).join(", ")} +${targetLabels.length - 2} more`;
}

export const MasterPromotionStatusOptions = [
	"Active",
	"Draft",
	"Inactive",
] as const satisfies readonly MasterPromotionStatus[];

export const MasterPromotionTableColumns = [
	{ key: "name", label: "Promotion", className: "w-[24rem]" },
	{ key: "billingCycle", label: "Coverage", className: "w-[15rem]" },
	{ key: "targetPlanIds", label: "Target plan", className: "w-[20rem]" },
	{ key: "startsAt", label: "Schedule", className: "w-[13rem]" },
	{ key: "value", label: "Discount", className: "w-[11rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "redemptions", label: "Usage limit", className: "w-[11rem]" },
	{ label: "Actions", className: "w-[6rem] text-right" },
] as const satisfies readonly (
	| {
			key: MasterPromotionTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];
