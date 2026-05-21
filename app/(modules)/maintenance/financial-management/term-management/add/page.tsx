import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { TermManagementActionPage } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementActionPage";

const PageTitle = "Add Term Management";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementTermManagementAddPage() {
	return <TermManagementActionPage />;
}


