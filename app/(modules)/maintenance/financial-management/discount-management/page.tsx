import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { DiscountManagementMain } from "@/app/src/ui/modules/maintenance/financial-management/discount-management/DiscountManagementMain";

const PageTitle = "Discount Management";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementDiscountManagementPage() {
	return <DiscountManagementMain />;
}


