import type {
	MasterPromotionDiscountKind,
	MasterPromotionStatus,
	MasterPromotionTableColumnKey,
	MasterPromotionTarget,
	MasterPromotionType,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";

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

export const MasterPromotionTargetOptions = [
	"All Plans",
	"Accounting",
	"Inventory",
	"Accounting + Inventory",
	"Add-ons",
	"Event Attendees",
] as const satisfies readonly MasterPromotionTarget[];

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
