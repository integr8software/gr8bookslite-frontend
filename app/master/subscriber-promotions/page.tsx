import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Subscriber Promotions | ${AppName}`,
	description: `Assign subscriber promotions for ${AppName}.`,
};

export default function MasterSubscriberPromotionsPage() {
	return <MasterPreviewPage pageKey="subscriberPromotions" />;
}
