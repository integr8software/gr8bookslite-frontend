import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/workspace/workspace-placeholder/WorkspacePlaceholderPage";
import { AppName } from "@/app/src/constants/shared/AppConstants";

export const metadata: Metadata = {
	title: `Companies | ${AppName}`,
	description: `Companies workspace mockup for ${AppName}.`,
};

export default function CompaniesPage() {
	return <ModulePreviewPage data={ModulePreviewPages.companies} />;
}
