import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { DiscountManagementFormPage } from "@/app/src/ui/modules/maintenance/financial-management/discount-management/DiscountManagementFormPage";

const PageTitle = "Add Discount Management";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementDiscountManagementAddPage() {
	return <DiscountManagementFormPage />;
}


