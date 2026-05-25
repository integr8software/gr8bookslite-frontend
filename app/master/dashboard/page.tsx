import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { WorkspaceOverviewPage } from "@/app/src/ui/workspace/dashboard/WorkspaceOverviewPage";

export const metadata: Metadata = {
	title: `Master Dashboard | ${AppName}`,
	description: `Master administration overview for ${AppName}.`,
};

export default function MasterDashboardPage() {
	return <WorkspaceOverviewPage />;
}
