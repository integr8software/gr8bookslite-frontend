import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MasterDashboardPage as MasterDashboardModulePage } from "@/app/src/ui/master/dashboard/MasterDashboardPage";

export const metadata: Metadata = {
	title: `Master Dashboard | ${AppName}`,
	description: `Master administration overview for ${AppName}.`,
};

export default function MasterDashboardPage() {
	return <MasterDashboardModulePage />;
}
