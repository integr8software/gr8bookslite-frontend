import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/workspace/workspace-placeholder/WorkspacePlaceholderData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";

export const metadata: Metadata = {
	title: `Projects | ${AppName}`,
	description: `Projects module mockup for ${AppName}.`,
};

export default function ProjectsPage() {
	return <ModulePreviewPage data={ModulePreviewPages.projects} />;
}
