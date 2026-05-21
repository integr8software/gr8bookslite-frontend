import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/module/module-preview/ModulePreviewPage";
import { AppName } from "@/app/src/constants/shared/AppConstants";

export const metadata: Metadata = {
	title: `Sales Management | ${AppName}`,
	description: `Sales management module mockup for ${AppName}.`,
};

export default function SalesManagementPage() {
	return <ModulePreviewPage data={ModulePreviewPages.salesManagement} />;
}
