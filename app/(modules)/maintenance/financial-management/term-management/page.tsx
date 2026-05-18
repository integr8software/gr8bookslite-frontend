import type { Metadata } from "next";
import { AppName } from "@/app/src/data/shared/AppConstants";
import { FinancialManagementTermManagementMain } from "@/app/src/ui/modules/maintenance/financial-management/term-management/Main";

const PageTitle = "Term Management";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementTermManagementPage() {
  return <FinancialManagementTermManagementMain />;
}


