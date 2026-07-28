import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { VehicleRepairMaintenanceListPage } from "@/app/src/ui/modules/delivery-vehicle-management/vehicle-repair-maintenance/VehicleRepairMaintenanceListPage";

const PageTitle = "Vehicle Repair and Maintenance";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementVehicleRepairMaintenancePage() {
  return <VehicleRepairMaintenanceListPage />;
}
