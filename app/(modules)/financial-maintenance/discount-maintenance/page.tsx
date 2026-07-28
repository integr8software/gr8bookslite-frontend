import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { DiscountMaintenanceListPage } from "@/app/src/ui/modules/financial-maintenance/discount-maintenance/DiscountMaintenanceListPage";

const PageTitle = "Discount Maintenance";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementDiscountMaintenancePage() {
	return <DiscountMaintenanceListPage />;
}


