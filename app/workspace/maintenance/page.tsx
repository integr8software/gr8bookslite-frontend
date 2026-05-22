import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";

export const metadata: Metadata = {
	title: `Maintenance | ${AppName}`,
	description: `Workspace maintenance mockup for ${AppName}.`,
};

export default function MaintenancePage() {
	return <ModulePreviewPage data={ModulePreviewPages.maintenance} />;
}
