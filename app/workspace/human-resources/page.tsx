import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/ModulePreview/ModulePreviewPage";

export const metadata: Metadata = {
  title: "Human Resources | Gr8Books Lite",
  description: "Human resources module mockup for Gr8Books Lite.",
};

export default function HumanResourcesPage() {
  return <ModulePreviewPage data={ModulePreviewPages.humanResources} />;
}
