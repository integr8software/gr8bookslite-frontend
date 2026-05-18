import type { Metadata } from "next";
import { ModulePreviewPages } from "@/app/src/data/shared/MainLayout/ModulePreviewData";
import { ModulePreviewPage } from "@/app/src/ui/shared/ModulePreview/ModulePreviewPage";

export const metadata: Metadata = {
  title: "Users & Roles | Gr8Books Lite",
  description: "Users and roles workspace mockup for Gr8Books Lite.",
};

export default function UsersRolesPage() {
  return <ModulePreviewPage data={ModulePreviewPages.usersRoles} />;
}
