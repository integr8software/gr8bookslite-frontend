import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { PricingPage } from "@/app/src/ui/pricing/PricingPage";

export const metadata: Metadata = {
	title: `Pricing | ${AppName}`,
	description: `Choose the ${AppName} plan that fits your business stage.`,
};

export default function PricingRoute() {
	return <PricingPage />;
}
