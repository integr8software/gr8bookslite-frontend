import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriberPromotionFormPage } from "@/app/src/ui/master/subscriber-promotions/MasterSubscriberPromotionFormPage";

export const metadata: Metadata = {
	title: `Give Promotion | ${AppName}`,
	description: `Assign subscriber promotions for ${AppName}.`,
};

export default function Page() {
	return <MasterSubscriberPromotionFormPage />;
}
