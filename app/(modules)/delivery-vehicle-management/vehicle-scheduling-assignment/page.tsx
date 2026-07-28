import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { VehicleSchedulingAssignmentListPage } from "@/app/src/ui/modules/delivery-vehicle-management/vehicle-scheduling-assignment/VehicleSchedulingAssignmentListPage";

const PageTitle = "Vehicle Scheduling & Assignment";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementVehicleSchedulingAssignmentPage() {
  return <VehicleSchedulingAssignmentListPage />;
}
