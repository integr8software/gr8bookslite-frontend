import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/modules/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/modules/shared/ModulePreviewPage";

export const metadata: Metadata = {
  title: "Companies | Gr8Books Lite",
  description: "Companies workspace mockup for Gr8Books Lite.",
};

export default function CompaniesPage() {
  return <ModulePreviewPage data={ModulePreviewPages.companies} />;
}
