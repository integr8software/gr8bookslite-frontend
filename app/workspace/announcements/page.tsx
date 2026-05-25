import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ModulePreviewPages } from "@/app/src/data/shared/workspace/workspace-placeholder/WorkspacePlaceholderData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";

export const metadata: Metadata = {
	title: `Announcements | ${AppName}`,
	description: `Workspace announcements mockup for ${AppName}.`,
};

export default function AnnouncementsPage() {
	return <ModulePreviewPage data={ModulePreviewPages.announcements} />;
}
