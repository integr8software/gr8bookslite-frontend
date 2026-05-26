import type {
	MasterPromotionDiscountKind,
	MasterPromotionExpirationMode,
	MasterPromotionLimitMode,
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
	{ key: "targetPlanIds", label: "Target plans", className: "w-[20rem]" },
	{ key: "value", label: "Value", className: "w-[10rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "redemptions", label: "Uses", className: "w-[10rem]" },
	{ label: "Actions", className: "w-[15rem] text-right" },
] as const satisfies readonly (
	| {
			key: MasterPromotionTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];
