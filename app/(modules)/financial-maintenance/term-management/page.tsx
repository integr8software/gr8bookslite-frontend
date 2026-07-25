import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { TermManagementListPage } from "@/app/src/ui/modules/financial-maintenance/term-management/TermManagementListPage";

const PageTitle = "Term Management";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementTermManagementPage() {
	return <TermManagementListPage />;
}


