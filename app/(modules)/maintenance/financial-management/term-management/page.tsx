import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { TermManagementMain } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementMain";

const PageTitle = "Term Management";

export const metadata: Metadata = {
	title: `${PageTitle} | ${AppName}`,
	description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementTermManagementPage() {
	return <TermManagementMain />;
}


