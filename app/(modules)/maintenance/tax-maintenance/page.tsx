import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { TaxMaintenanceListPage } from "@/app/src/ui/modules/maintenance/tax-maintenance/TaxMaintenanceListPage";

const PageTitle = "Tax Maintenance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function TaxMaintenancePage() {
  return <TaxMaintenanceListPage />;
}
