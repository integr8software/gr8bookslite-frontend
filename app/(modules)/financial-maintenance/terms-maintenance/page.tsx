import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { TermsMaintenanceListPage } from "@/app/src/ui/modules/financial-maintenance/terms-maintenance/TermsMaintenanceListPage";

const PageTitle = "Terms Maintenance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceFinancialManagementTermsMaintenancePage() {
  return <TermsMaintenanceListPage />;
}
