import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ModulePreviewPages } from "@/app/src/data/shared/workspace/workspace-placeholder/WorkspacePlaceholderData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";

export const metadata: Metadata = {
	title: `Integrations | ${AppName}`,
	description: `Workspace integrations mockup for ${AppName}.`,
};

export default function IntegrationsPage() {
	return <ModulePreviewPage data={ModulePreviewPages.integrations} />;
}
