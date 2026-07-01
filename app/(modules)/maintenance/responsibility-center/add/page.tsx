import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ResponsibilityCenterAction } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterAction";

const PageTitle = "Add Responsibility Center";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementResponsibilityCenterAddPage() {
	return <ResponsibilityCenterAction />;
}
