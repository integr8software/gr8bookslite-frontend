import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import {
	AppDescription,
	AppKeywords,
} from "@/app/src/constants/shared/app/AppMetadata";
import { LandingPage } from "@/app/src/ui/landing-page/LandingPage";

export const metadata: Metadata = {
	title: `${AppName} | Cloud Accounting and Inventory Software`,
	description: AppDescription,
	keywords: [...AppKeywords],
	alternates: {
		canonical: "/",
	},
};

export default function Page() {
  return <LandingPage />;
}
