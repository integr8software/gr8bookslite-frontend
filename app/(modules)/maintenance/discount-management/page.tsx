import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { DiscountManagementListPage } from "@/app/src/ui/modules/maintenance/financial-management/discount-management/DiscountManagementListPage";

const PageTitle = "Discount Management";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementDiscountManagementPage() {
	return <DiscountManagementListPage />;
}


