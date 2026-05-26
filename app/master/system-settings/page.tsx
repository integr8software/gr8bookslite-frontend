import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterPreviewPage } from "@/app/src/ui/master/MasterPreviewPage";

export const metadata: Metadata = {
	title: `System Settings | ${AppName}`,
	description: `Master system settings for ${AppName}.`,
};

export default function MasterSystemSettingsPage() {
	return <MasterPreviewPage pageKey="systemSettings" />;
}
