import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ModulePreviewPages } from "@/app/src/data/shared/modules/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/module/ModulePreviewPage";

export const metadata: Metadata = {
	title: `System Settings | ${AppName}`,
	description: `Workspace system settings mockup for ${AppName}.`,
};

export default function SystemSettingsPage() {
	return <ModulePreviewPage data={ModulePreviewPages.systemSettings} />;
}
