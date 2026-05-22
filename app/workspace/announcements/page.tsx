import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";

export const metadata: Metadata = {
	title: `Announcements | ${AppName}`,
	description: `Workspace announcements mockup for ${AppName}.`,
};

export default function AnnouncementsPage() {
	return <ModulePreviewPage data={ModulePreviewPages.announcements} />;
}
