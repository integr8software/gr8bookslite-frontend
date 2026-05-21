import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/AppConstants";
import { ResponsibilityCenterAction } from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterAction";

const PageTitle = "Edit Responsibility Center";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementResponsibilityCenterEditPage() {
	return <ResponsibilityCenterAction />;
}
