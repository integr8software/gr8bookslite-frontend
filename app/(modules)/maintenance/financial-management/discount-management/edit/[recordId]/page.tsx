import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { DiscountManagementActionPage } from "@/app/src/ui/modules/maintenance/financial-management/discount-management/DiscountManagementActionPage";

const PageTitle = "Edit Discount Management";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementDiscountManagementEditPage() {
	return <DiscountManagementActionPage />;
}


