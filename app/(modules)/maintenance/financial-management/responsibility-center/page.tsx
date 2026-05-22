import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { ResponsibilityCenterMain } from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterMain";

const PageTitle = "Responsibility Center";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementResponsibilityCenterPage() {
	return <ResponsibilityCenterMain />;
}
