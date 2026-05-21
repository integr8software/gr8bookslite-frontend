import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";
import { AppName } from "@/app/src/constants/shared/AppConstants";

export const metadata: Metadata = {
	title: `Users & Roles | ${AppName}`,
	description: `Users and roles workspace mockup for ${AppName}.`,
};

export default function UsersRolesPage() {
	return <ModulePreviewPage data={ModulePreviewPages.usersRoles} />;
}
