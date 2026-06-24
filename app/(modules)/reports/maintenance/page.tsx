import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MaintenanceMain } from "@/app/src/ui/modules/reports/maintenance/Main";

const PageTitle = "Maintenance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function ReportsMaintenancePage() {
  return <MaintenanceMain />;
}


