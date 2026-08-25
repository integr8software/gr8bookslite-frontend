import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { ServicesMaintenanceListPage } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceListPage";

const PageTitle = "Services Maintenance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function MaintenanceServicesMaintenancePage() {
  return <ServicesMaintenanceListPage />;
}
