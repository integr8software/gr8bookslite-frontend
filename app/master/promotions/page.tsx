import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPromotionListPage } from "@/app/src/ui/master/promotions/MasterPromotionListPage";

export const metadata: Metadata = {
	title: `Promotions | ${AppName}`,
	description: `Master promotion records for ${AppName}.`,
};

export default function Page() {
	return <MasterPromotionListPage />;
}
