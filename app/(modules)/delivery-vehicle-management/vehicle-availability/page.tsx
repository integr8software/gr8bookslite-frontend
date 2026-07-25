import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { VehicleAvailabilityListPage } from "@/app/src/ui/modules/delivery-vehicle-management/vehicle-availability/VehicleAvailabilityListPage";

const PageTitle = "Vehicle Availability";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementVehicleAvailabilityPage() {
  return <VehicleAvailabilityListPage />;
}
