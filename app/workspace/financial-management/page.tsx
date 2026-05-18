import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/ModulePreview/ModulePreviewPage";

export const metadata: Metadata = {
  title: "Financial Management | Gr8Books Lite",
  description: "Financial management module mockup for Gr8Books Lite.",
};

export default function FinancialManagementPage() {
  return <ModulePreviewPage data={ModulePreviewPages.financialManagement} />;
}
