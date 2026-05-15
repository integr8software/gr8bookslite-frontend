import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/modules/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/modules/shared/ModulePreviewPage";

export const metadata: Metadata = {
  title: "Projects | Gr8Books Lite",
  description: "Projects module mockup for Gr8Books Lite.",
};

export default function ProjectsPage() {
  return <ModulePreviewPage data={ModulePreviewPages.projects} />;
}
