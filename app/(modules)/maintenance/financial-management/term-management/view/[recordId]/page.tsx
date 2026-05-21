import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { TermManagementActionPage } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementActionPage";

const PageTitle = "View Term Management";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementTermManagementViewPage() {
	return <TermManagementActionPage />;
}


