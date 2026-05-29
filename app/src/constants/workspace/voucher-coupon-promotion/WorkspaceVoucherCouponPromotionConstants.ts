import type {
	WorkspaceVoucherCouponPromotionStatusFilter,
	WorkspaceVoucherCouponPromotionTableColumnKey,
	WorkspaceVoucherCouponPromotionTypeFilter,
} from "@/app/src/types/workspace/voucher-coupon-promotion/WorkspaceVoucherCouponPromotionTypes";

export const WorkspaceVoucherCouponPromotionHref =
	"/workspace/voucher-coupon-promotion";

export const WorkspaceVoucherCouponPromotionPaginationStorageKey =
	"workspace-voucher-coupon-promotion";

export const WorkspaceVoucherCouponPromotionStatusOptions = [
	"All statuses",
	"Available",
	"Used",
	"Expired",
	"Revoked",
] as const satisfies readonly WorkspaceVoucherCouponPromotionStatusFilter[];

export const WorkspaceVoucherCouponPromotionTypeOptions = [
	"All types",
	"Promo Code",
	"Coupon",
	"Voucher",
	"Event Promo",
] as const satisfies readonly WorkspaceVoucherCouponPromotionTypeFilter[];

export const WorkspaceVoucherCouponPromotionTableColumns = [
	{ key: "subscriberName", label: "Company", className: "w-[20rem]" },
	{ key: "promotionName", label: "Promotion", className: "w-[18rem]" },
	{ key: "type", label: "Type", className: "w-[10rem]" },
	{ key: "value", label: "Value", className: "w-[9rem]" },
	{ key: "status", label: "Subscriber Status", className: "w-[12rem]" },
	{ key: "masterStatus", label: "Master Status", className: "w-[11rem]" },
	{ key: "expiresAt", label: "Expires", className: "w-[11rem]" },
] as const satisfies readonly {
	key: WorkspaceVoucherCouponPromotionTableColumnKey;
	label: string;
	className: string;
}[];

