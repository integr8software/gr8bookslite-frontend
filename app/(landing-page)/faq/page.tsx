import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import FAQPage from "@/app/src/ui/landing-page/FAQPage";

export const metadata: Metadata = {
	title: `FAQ | ${AppName}`,
	description: `Find answers to common questions about ${AppName}, account access, accounting, inventory, and workspace management.`,
};

export default function Page() {
	return <FAQPage />;
}
