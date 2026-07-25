import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { VehicleInspectionsListPage } from "@/app/src/ui/modules/delivery-vehicle-management/vehicle-inspections/VehicleInspectionsListPage";

const PageTitle = "Vehicle Inspections";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementVehicleInspectionsPage() {
  return <VehicleInspectionsListPage />;
}
