import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { VehicleAssignmentListPage } from "@/app/src/ui/modules/delivery-vehicle-management/vehicle-assignment/VehicleAssignmentListPage";

const PageTitle = "Vehicle Assignment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementVehicleAssignmentPage() {
  return <VehicleAssignmentListPage />;
}
