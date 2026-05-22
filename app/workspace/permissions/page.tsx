import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";
import { AppName } from "@/app/src/constants/shared/AppConstants";

export const metadata: Metadata = {
	title: `Permissions | ${AppName}`,
	description: `Permissions workspace mockup for ${AppName}.`,
};

export default function PermissionsPage() {
	return <ModulePreviewPage data={ModulePreviewPages.permissions} />;
}
