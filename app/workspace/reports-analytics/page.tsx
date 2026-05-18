import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/ModulePreview/ModulePreviewPage";

export const metadata: Metadata = {
  title: "Reports & Analytics | Gr8Books Lite",
  description: "Reports and analytics module mockup for Gr8Books Lite.",
};

export default function ReportsAnalyticsPage() {
  return <ModulePreviewPage data={ModulePreviewPages.reportsAnalytics} />;
}
