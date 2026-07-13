import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ResponsibilityCenterListPage } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterListPage";

const PageTitle = "Responsibility Center";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementResponsibilityCenterPage() {
	return <ResponsibilityCenterListPage />;
}
