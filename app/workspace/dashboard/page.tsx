import type { Metadata } from "next";
import { WorkspaceOverviewPage } from "@/app/src/ui/workspace/dashboard/WorkspaceOverviewPage";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";

export const metadata: Metadata = {
  title: `Dashboard | ${AppName}`,
  description: `Workspace administration overview mockup for ${AppName}.`,
};

export default function DashboardPage() {
  return <WorkspaceOverviewPage />;
}
