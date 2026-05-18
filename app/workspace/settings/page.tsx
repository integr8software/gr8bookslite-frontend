import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/ModulePreview/ModulePreviewPage";

export const metadata: Metadata = {
  title: "Settings | Gr8Books Lite",
  description: "Settings workspace mockup for Gr8Books Lite.",
};

export default function SettingsPage() {
  return <ModulePreviewPage data={ModulePreviewPages.settings} />;
}
