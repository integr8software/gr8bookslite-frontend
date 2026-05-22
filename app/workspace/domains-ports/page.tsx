import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";

export const metadata: Metadata = {
	title: `Domains & Ports | ${AppName}`,
	description: `Workspace domains and ports mockup for ${AppName}.`,
};

export default function DomainsPortsPage() {
	return <ModulePreviewPage data={ModulePreviewPages.domainsPorts} />;
}
