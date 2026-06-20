import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import ContactUsPage from "@/app/src/ui/landing-page/ContactUsPage";

export const metadata: Metadata = {
	title: `Contact Us | ${AppName}`,
	description: `Contact us about your ${AppName} account, workspace, billing, or subscription.`,
};

export default function Page() {
	return <ContactUsPage />;
}
