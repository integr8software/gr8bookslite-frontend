import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterSubscriptionsPage as MasterSubscriptionsModulePage } from "@/app/src/ui/master/subscriptions/MasterSubscriptionsPage";

export const metadata: Metadata = {
	title: `Subscription | ${AppName}`,
	description: `Master subscriber duration and billing review for ${AppName}.`,
};

export default function MasterSubscriptionsPage() {
	return <MasterSubscriptionsModulePage />;
}
