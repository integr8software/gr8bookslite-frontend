import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/app/AppConstants";
import { TermManagementListPage } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementListPage";

const PageTitle = "Term Management";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementTermManagementPage() {
	return <TermManagementListPage />;
}


