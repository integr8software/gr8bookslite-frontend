import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";

export const metadata: Metadata = {
	title: `Branches | ${AppName}`,
	description: `Workspace branches mockup for ${AppName}.`,
};

export default function BranchesPage() {
	return <ModulePreviewPage data={ModulePreviewPages.branches} />;
}
