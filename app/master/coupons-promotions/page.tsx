import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Coupons & Promotions | ${AppName}`,
	description: `Master coupons and promotions for ${AppName}.`,
};

export default function MasterCouponsPromotionsPage() {
	return <MasterPreviewPage pageKey="couponsPromotions" />;
}
