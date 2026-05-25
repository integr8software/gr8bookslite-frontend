import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Subscriptions | ${AppName}`,
	description: `Master subscriptions for ${AppName}.`,
};

export default function MasterSubscriptionsPage() {
	return <MasterPreviewPage pageKey="subscriptions" />;
}
