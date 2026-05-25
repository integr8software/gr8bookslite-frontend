import type {
	MasterPromotionDiscountKind,
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

export function getMasterPromotionTargetLabel(target: string) {
	return (
		MasterPromotionTargetOptions.find((option) => option.value === target)
			?.name ?? target
	);
}

export const MasterPromotionStatusOptions = [
	"Active",
	"Draft",
	"Inactive",
] as const satisfies readonly MasterPromotionStatus[];

export const MasterPromotionTableColumns = [
	{ key: "name", label: "Promotion", className: "w-[24rem]" },
	{ key: "target", label: "Target", className: "w-[14rem]" },
	{ key: "value", label: "Value", className: "w-[10rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ key: "redemptions", label: "Uses", className: "w-[8rem]" },
	{ label: "Actions", className: "w-[15rem] text-right" },
] as const satisfies readonly (
	| {
			key: MasterPromotionTableColumnKey;
			label: string;
			className: string;
	  }
	| { label: string; className: string }
)[];
