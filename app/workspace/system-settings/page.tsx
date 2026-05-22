import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";

export const metadata: Metadata = {
	title: `System Settings | ${AppName}`,
	description: `Workspace system settings mockup for ${AppName}.`,
};

export default function SystemSettingsPage() {
	return <ModulePreviewPage data={ModulePreviewPages.systemSettings} />;
}
