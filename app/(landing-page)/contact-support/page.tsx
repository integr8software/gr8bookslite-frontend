import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ContactSupportPage } from "@/app/src/ui/auth/ContactSupportPage";

export const metadata: Metadata = {
	title: `Contact Support | ${AppName}`,
	description: `Get help with your ${AppName} account, workspace, billing, or subscription.`,
};

export default function Page() {
	return <ContactSupportPage />;
}
