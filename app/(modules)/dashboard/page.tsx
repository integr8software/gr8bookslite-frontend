import type { Metadata } from "next";
import { WorkspaceOverviewPage } from "@/app/src/ui/modules/dashboard/WorkspaceOverviewPage";

export const metadata: Metadata = {
  title: "Dashboard | Gr8Books Lite",
  description: "Workspace administration overview mockup for Gr8Books Lite.",
};

export default function DashboardPage() {
  return <WorkspaceOverviewPage />;
}
