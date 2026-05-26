import type {
	MasterCouponPromotionDiscountKind,
	MasterCouponPromotionStatus,
	MasterCouponPromotionTarget,
	MasterCouponPromotionType,
} from "@/app/src/types/master/coupons-promotions/MasterCouponPromotionTypes";

export const MasterCouponsPromotionsHref = "/master/coupons-promotions";

export const MasterCouponPromotionTypeOptions = [
	"Promo",
	"Coupon",
	"Voucher",
] as const satisfies readonly MasterCouponPromotionType[];

export const MasterCouponPromotionDiscountKindOptions = [
	"Percent",
	"Fixed",
] as const satisfies readonly MasterCouponPromotionDiscountKind[];

export const MasterCouponPromotionTargetOptions = [
	"All Plans",
	"Accounting",
	"Inventory",
	"Accounting + Inventory",
	"Add-ons",
] as const satisfies readonly MasterCouponPromotionTarget[];

export const MasterCouponPromotionStatusOptions = [
	"Active",
	"Draft",
	"Inactive",
] as const satisfies readonly MasterCouponPromotionStatus[];
