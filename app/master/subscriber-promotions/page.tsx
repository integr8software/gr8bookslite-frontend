import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriberPromotionListPage } from "@/app/src/ui/master/subscriber-promotions/MasterSubscriberPromotionListPage";

export const metadata: Metadata = {
	title: `Subscriber Promotions | ${AppName}`,
	description: `Assign subscriber promotions for ${AppName}.`,
};

export default function MasterSubscriberPromotionsPage() {
	return <MasterSubscriberPromotionListPage />;
}
