import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { VehicleTypesListPage } from "@/app/src/ui/modules/delivery-vehicle-management/vehicle-types/VehicleTypesListPage";

const PageTitle = "Vehicle Types";

export const metadata: Metadata = {
  title: `${PageTitle} | ${AppName}`,
  description: `${PageTitle} page for ${AppName}.`,
};

export default function DeliveryVehicleManagementVehicleTypesPage() {
  return <VehicleTypesListPage />;
}
