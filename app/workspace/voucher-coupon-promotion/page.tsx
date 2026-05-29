import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { WorkspaceVoucherCouponPromotionPage } from "@/app/src/ui/workspace/voucher-coupon-promotion/WorkspaceVoucherCouponPromotionPage";

export const metadata: Metadata = {
  title: `Voucher, Coupon, Promotion | ${AppName}`,
  description: `Workspace vouchers, coupons, and promotions assigned from subscriber master data for ${AppName}.`,
};

export default function VoucherCouponPromotionPage() {
  return <WorkspaceVoucherCouponPromotionPage />;
}
