import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `Company Settings | ${AppName}`,
	description: `Master company settings for ${AppName}.`,
};

export default function MasterCompanySettingsPage() {
	return <MasterPreviewPage pageKey="companySettings" />;
}
