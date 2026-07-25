import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { MaintenanceAndRepairsListPage } from "@/app/src/ui/modules/delivery-vehicle-management/maintenance-and-repairs/MaintenanceAndRepairsListPage";

const PageTitle = "Maintenance & Repairs";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementMaintenanceAndRepairsPage() {
  return <MaintenanceAndRepairsListPage />;
}
