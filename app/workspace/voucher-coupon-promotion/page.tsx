import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ModulePreviewPages } from "@/app/src/data/shared/module/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/module/ModulePreviewPage";

export const metadata: Metadata = {
  title: `Voucher, Coupon, Promotion | ${AppName}`,
  description: `Workspace voucher, coupon, and promotion mockup for ${AppName}.`,
};

export default function VoucherCouponPromotionPage() {
  return <ModulePreviewPage data={ModulePreviewPages.couponsPromotions} />;
}
