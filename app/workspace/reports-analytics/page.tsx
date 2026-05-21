import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/module/module-preview/ModulePreviewPage";
import { AppName } from "@/app/src/constants/shared/AppConstants";

export const metadata: Metadata = {
	title: `Reports & Analytics | ${AppName}`,
	description: `Reports and analytics module mockup for ${AppName}.`,
};

export default function ReportsAnalyticsPage() {
	return <ModulePreviewPage data={ModulePreviewPages.reportsAnalytics} />;
}
