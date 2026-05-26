import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPromotionFormPage } from "@/app/src/ui/master/promotions/MasterPromotionFormPage";

export const metadata: Metadata = {
	title: `Add Promotion | ${AppName}`,
	description: `Add a master promotion record for ${AppName}.`,
};

export default function Page() {
	return <MasterPromotionFormPage mode="add" />;
}
