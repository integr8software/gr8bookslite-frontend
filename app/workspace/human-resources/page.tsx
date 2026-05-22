import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";
import { AppName } from "@/app/src/constants/shared/AppConstants";

export const metadata: Metadata = {
	title: `Human Resources | ${AppName}`,
	description: `Human resources module mockup for ${AppName}.`,
};

export default function HumanResourcesPage() {
	return <ModulePreviewPage data={ModulePreviewPages.humanResources} />;
}
