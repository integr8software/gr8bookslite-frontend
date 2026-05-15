import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/modules/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/modules/shared/ModulePreviewPage";

export const metadata: Metadata = {
  title: "Permissions | Gr8Books Lite",
  description: "Permissions workspace mockup for Gr8Books Lite.",
};

export default function PermissionsPage() {
  return <ModulePreviewPage data={ModulePreviewPages.permissions} />;
}
